/* Magic Mirror
 * Module: MagicMirror-Bose-Module
 *
 * By SpoturDeal https://github.com/
 * list enhancement & usage of asynx/await and got rid of deprecated "request" dependency
 * MIT Licensed.
 */
 
var NodeHelper = require('node_helper');
var getBose = require('node-fetch');
var updateInterval = 10000 ;
var iplist = [] ;

module.exports = NodeHelper.create({
  start: function () {
    console.log('Bose helper started ...');
  },

  readOnebose: async function(endpoint) {
	const regexp = /source="INVALID_SOURCE"|source="STANDBY"/ ;
	try {
		const res = await getBose(endpoint) ;
		const data = await res.text();
		if (data.search(regexp) != -1) {
			return {res: "off" , body: data} ;
		}
		return {res: "on" , body: data} ;
	} catch (err) {
		return {res: "error" , body: JSON.stringify(err)};
	}
  },
	  
  readAllboses: async function (iplist) {
	if (!Array.isArray(iplist)) { iplist = [iplist] } ;
	var answer ;
	for (let ip of iplist) {
		  answer = await this.readOnebose("http://"+ ip + ":8090/now_playing") ;
		  if (answer.res === "on") { break} ;
	};
	return answer ;
  },
	
  boseFetcher: function() {
	var self = this ;
	(async () => {
		const result = await this.readAllboses(iplist);
		if (result.res != "error") {
			this.sendSocketNotification('BOSE_DATA', result.body);
		}
	})();
	setTimeout(function(){ self.boseFetcher();}, updateInterval )
  },	
	
  socketNotificationReceived: function(notification, payload) {
	if (notification === 'BOSE_READ') {
		updateInterval = payload.interval ;
		iplist = payload.boselist ;
		this.boseFetcher() ;
	}
  }
  
});