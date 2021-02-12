/* Magic Mirror
 * Module: MagicMirror-Bose-Soundtouch
 *
 * By SpoturDeal https://github.com/SpoturDeal 
 * updated by MartinKooij 2021 (list of bose speakers)
 * MIT Licensed.
 */
 
 Module.register('MMM-Bose-Soundtouch', {
	defaults: {
        updateInterval: 10,                          // every 5 seconds
        apiBase: '192.168.xxx.xxx',                 // the IPaddress(es) of the Bose Soundtouch in your home network
        hideImage: false,
	},
	start: function() {
		Log.info('Starting module: ' + this.name);
		this.sendSocketNotification('BOSE_READ', 
			{
			boselist: this.config.apiBase, 
			interval: this.config.updateInterval * 1000
			} 
		);
	},
	
	render: function(data){
	    var json=xml2json(data);
        var music = json.nowPlaying;
        if (this.config.hideImage === false ){
           var sArt = $(data).find('art').text().trim();
	   var htmlImage='<img src="' + sArt + '"/>';
        } else {
           var sArt = false;
	   var htmlImage='';
        }
	//var sArt = $(data).find('art').text().trim();

        var sTitle='';
		var sAlbum = '';
        var lenAlbum=30;
        var showMusic = false;
        if (music.source == "SPOTIFY"){
            sTitle = '<i class="fa fa-spotify" style="color:#1ED760;"></i> ' + music.ContentItem.itemName;
            showMusic = true;
            sAlbum=music.album;
        } else if (music.source == "AMAZON" || music.source == "ALEXA"){
            sTitle = '<i class="fa fa-amazon" style="color:#232F3E;"></i> ' + music.ContentItem.itemName;
            showMusic = true;
            sAlbum=music.album;
        } else if (music.source == "DEEZER" || music.source == "ITUNES" || music.source == "TUNEIN"  || music.source == "PRODUCT" || music.source == "AIRPLAY"){
            sTitle = '<i class="fa fa-music" style="color:#FFFFFF;"></i> ' + music.ContentItem.itemName;
            showMusic = true;
            sAlbum=music.album;
        } else if (music.source == "INTERNET_RADIO"){
            sTitle = "Internet radio ";
            showMusic = true;
            sAlbum = music.stationName;
		} else if (music.source == "BLUETOOTH"){
            sTitle = music.ContentItem.itemName;
            showMusic = true;
            sAlbum = music.album;
			sArt = true ;
			htmlImage='<img src="https://cdn.osxdaily.com/wp-content/uploads/2013/12/bluetooth-icon.png" width="100" height="100" />' ;
        } 
		else if (music.source == "STANDBY"|| music.source == "INVALID_SOURCE"){
            sTitle ='<i class="fa fa-spotify"></i> stand by';
        } else if (music.source == "STORED_MUSIC"){
            sTitle = '<i class="fa fa-music"></i> Soundtouch ';
            showMusic = true;
            sAlbum = false;
          } else if (music.source == "AUX"){
              sTitle = "AUX Input ";
              sAlbum = "Playing from aux input.";
              showMusic = true;

          } else {
            sTitle = "Soundtouch - Your help is needed";
            sAlbum = "Please send me a message with the contents of<br>http:/" + this.config.apiBase + ':8090/now_playing<br>I can add the unknown service.';
            showMusic = false;
            lenAlbum=150;
        }
        var text = '<div>';
        text +='<header class="module-header">' + sTitle + '</header>';
        text +='<table>';
        text +='<tr><td class="small">' + (music.track?this.maxSize(music.track,30):'') + '</td><td class="small"><i class="fa fa-music"></i><td></td><td class="small" rowspan="3">' + (sArt?htmlImage:'') + '</td></tr>'

        text += (music.artist?'<tr><td class="small">' + this.maxSize(music.artist,30) + '</td><td class="small"><i class="fa fa-user-o"></i></td></tr>':'');
        text += (sAlbum?'<tr><td class="small">' + this.maxSize(sAlbum,lenAlbum) + '</td><td class="small"><i class="fa fa-file-audio-o"></i></td></tr>':'');
        text += '</table></div>';
        // if no source found  show nothing
        if (showMusic===false) {
            text=' ';
        }
		this.loaded = true;
		// only update dom if content changed
		if(this.dom !== text){
			this.dom = text;
			this.updateDom(this.config.animationSpeed);
		}
	},
	html: {
		loading: '<div class="dimmed light small"></div>'

	},
	getScripts: function() {
		return [
			'String.format.js',
            'xml2json.js',
			'//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.js'
		];
	},
	getStyles: function() {
		return ['bose.css'];
	},
    maxSize: function(sTr,len){
       if(sTr.length > len) {
          sTr = sTr.substring(0,len-1)+"...";
       }
       return sTr;
    },
	getDom: function() {
		var content = '';
		if (!this.loaded) {
			content = this.html.loading;
		}else if(this.data.position.endsWith("left")){
			content = '<ul class="flip">'+this.dom+'</ul>';
		}else{
			content = '<ul>'+this.dom+'</ul>';
		}
		return $('<div class="bose">'+content+'</div>')[0];
	},
    socketNotificationReceived: function(notification, payload) {
      if (notification === 'BOSE_DATA') {
          console.log('received BOSE_DATA');
		  this.render(payload);
      }
    }
});