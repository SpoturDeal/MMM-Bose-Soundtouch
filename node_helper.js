/* Magic Mirror
 * Module: MagicMirror-Bose-Module
 *
 * By SpoturDeal https://github.com/
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log('Bose helper started ...');
  },
  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, url) {
    if (notification === 'BOSE_READ') {
//      console.log(notification, url);
      var self = this;
      request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
//		  console.log(body);
		  self.sendSocketNotification('BOSE_DATA', body);
		}
      });
    }
  }
  
});