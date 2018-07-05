
var rpcOps = require('../../RPCConnection.js') 
var IOUState = Java.type('com.example.state.IOUState')
var ExampleFlow = Java.type('com.example.flow.ExampleFlow')
var CordaX500Name = Java.type('net.corda.core.identity.CordaX500Name')

var myself = "PartyA"
var notary = "Notary"
exports.me = function(req, res) {
    var name = rpcOps.nodeInfo().getLegalIdentities().get(0).getName().toString()
    res.json({ "me": name });
}

exports.peers = function(req, res) {
    var peers = []
    var nodeInfo = rpcOps.networkMapSnapshot()
    nodeInfo.forEach(element => {
        if (element.getLegalIdentities().get(0).nameOrNull().getOrganisation().toString() != myself && element.getLegalIdentities().get(0).nameOrNull().getOrganisation().toString()!=notary){

            console.log(element.getLegalIdentities().get(0).nameOrNull().getOrganisation().toString())
            peers.push(element.getLegalIdentities().get(0).toString())
        }
    })

    res.json({ "peers": peers });
}

exports.getIOUs = function(req, res) {
    var ious = []
    var iou = rpcOps.vaultQuery(IOUState).getStates()
    iou.forEach(element => {
        ious.push(element.getState().getData().toString())
    })

    res.json({ "IOUs": ious});

}

exports.createIOU = function(req, res) {
    
    var iouValue = req.body.iouValue
    var otherPartyOrgaName = req.body.otherPartyOrgName
    var otherPartyOrgCountry = req.body.otherPartyOrgCountry
    var otherPartyOrgLocality = req.body.otherPartyOrgLocality
    var otherParty = rpcOps.wellKnownPartyFromX500Name(new CordaX500Name(otherPartyOrgaName, otherPartyOrgCountry, otherPartyOrgLocality))
    try{
        var signedTx = rpcOps.startTrackedFlowDynamic(ExampleFlow.Initiator, iouValue, otherParty).getReturnValue().get()
        res.json({ "Transaction ID": signedTx.getId().toString() });
    }catch (ex){
        res.json({ "Error": ex.getMessage()}); 
    }
}