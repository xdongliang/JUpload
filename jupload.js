(function() {
	var that;
	var model = function(el, options) {
		that = this;

		that.$el = $(el);
		that.crlf = '\r\n';
		that.boundary = "emptychar0";
		that.dashes = "--";

		that.settings = {
			"maxSize": "",
			"name": "uploadFileName",

			/* 
			 * 文件筛选
			 * audio/* 可以接受所有的音频文件
			 * video/*	可以接受所有的视频文件
			 * image/*	可以接受所有的图片文件
			*/
			"accept": "",
			/*
			 * 上传服务端URL地址
			*/
			"posturl": "",

			//本地加载相关事件  必须支持window.FileReader
			"onClientLoad": null,
			//服务端上传监听事件
			"onServerProgress": null,
			"onServerReadyStateChange": null,

			"onError": function(res) {alert("file upload error code=" + res.code + " message=" + res.message);},
			//成功回调函数
			"onSuccess": function(){console.log('upload success')},
			//点击事件前验证 return true | false
			"onBeforeClick": function(){console.log('upload onBeforeClick default'); return true;} 
		};

		for (key in options) {
			that.settings[key] = options[key];
		}

		that.$el.css('position', 'relative');

		var input = document.createElement("input");
		input.id = "__upload_input__";
		input.type = "file";
		input.accept = that.settings.accept;
		input.style.cssText = "position:absolute;left:-10000px;top:-10000px;";

		that.$el.append(input);

		that.$el.bind("click", function() {
			if (that.settings.onBeforeClick) {
				if (that.settings.onBeforeClick()) {
					input.click();
				}
			} else {
				input.click();
			}

		})
		$(input).bind("change", function() {
			var files = this.files;
			for (var i = 0; i < files.length; i++) {
				that.fileHandler(files[i]);
			}
		});

	}

	model.prototype = {
		fileHandler: function(file) {
			if (that.settings.maxSize != '' && file.size > that.settings.maxSize) {
				var obj = {
					code: 4001,
					message: "文件大小超出限制"
				};
				if (that.settings.onError) that.settings.onError(obj);
				console.log(JSON.stringify(obj));
				return;
			}

			if ('fileReader' == 'fileReader') {
				if ('FileReader' in window) {
					var fileReader = new FileReader();
					fileReader.onload = function(e) {
						if (that.settings.onClientLoad) {
							that.settings.onClientLoad(e, file, this);
						}
					};
					fileReader.readAsDataURL(file);
				} else {
					console.log("FileReader is not defined");
				}
			}
			var xmlHttpRequest = new XMLHttpRequest();
			if ('serverevent' == 'serverevent') {
				xmlHttpRequest.upload.onprogress = function(e) {
					if (that.settings.onServerProgress) {
						that.settings.onServerProgress(e, file);
					}
				};
				xmlHttpRequest.onreadystatechange = function(e) {
					if (that.settings.onServerReadyStateChange) {
						that.settings.onServerReadyStateChange(e, file, xmlHttpRequest.readyState);
					}
					if (that.settings.onSuccess && xmlHttpRequest.readyState == 4 &&
						xmlHttpRequest.status == 200) {
						that.settings.onSuccess(e, file, xmlHttpRequest.responseText);
					}
				};
			}

			var url = that.settings.postUrl;
			if (typeof that.settings.postUrl === "function")
				url = that.settings.postUrl();
			xmlHttpRequest.open("POST", url, true);

			var formData = new FormData();
			formData.append(that.settings.name, file);
			xmlHttpRequest.send(formData);
		}
	}
	window.JUpload = model;

})()