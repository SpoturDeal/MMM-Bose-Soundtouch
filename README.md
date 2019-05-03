# MMM-Bose-Soundtouch

This <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module shows the music your Bose Soundtouch is playing


## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/spoturdeal/MMM-Bose-Soundtouch.git`.
2. Add the module inside `config.js` placing it where you prefer ;)

## Update
2019/05/03 - Added option to hide the Image requested by EarthwormJim55

## Config


|Option|Description|
|---|---|
|`updateInterval`|How fast do you like updates.<br>**Type:** `Integer`<br>**Default:** <i>5</i>| seconds 
|`apiBase`|The IP Address of your Bose Soundtouch.<br>**Type:** `string`<br>**Default:** <i>192.168.xxx.xxx</i>|
|`hideImage`|If true there will be no image of the song.<br>**Type:** `Boolean`<br>**Default:** <i>false</i>|


Here is an example of an entry in `config.js`
```
{
	module: "MMM-Bose-Soundtouch",
	position: "top_right",   // see mirror setting for options
	config: {          
		updateInterval: 5, // every 5 seconds
		apiBase: '192.168.xxx.xxx',
	}
}
```

## Screenshots
#### Display type: details
![Screenshot of detail mode](/Soundtouch-preview.png?raw=true )


The MIT License (MIT)
=====================

Copyright © 2018/2019 SpoturDeal - Carl 

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability,
whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
