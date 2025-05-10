{
    let view = {
        el: '.uploadArea',
        find(selector) {
            return $(this.el).find(selector)[0]; // 返回 DOM 元素
        }
    };
    let model = {};
    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.initQiniu();
        },
        initQiniu() {
            let self = this; // 保存 this 的引用
            document.addEventListener('DOMContentLoaded', function () {
                // 初始化 Qiniu 上传器
                var uploader = Qiniu.uploader({
                    runtimes: 'html5',
                    browse_button: self.view.find('#uploadButton'), // 使用保存的引用
                    uptoken_url: 'http://192.168.229.1:8888/uptoken',
                    domain: 'sue1ry4xr.hn-bkt.clouddn.com',
                    get_new_uptoken: false,
                    max_file_size: '40mb',
                    dragdrop: true,
                    drop_element: self.view.find('#uploadContainer'), // 使用保存的引用
                    auto_start: true,
                    init: {
                        'FilesAdded': function (up, files) {
                            plupload.each(files, function (file) {
                                console.log('文件已添加:', file.name);
                            });
                        },
                        'BeforeUpload': function (up, file) {
                            window.eventHub.emit('beforeUpload')
                        },
                        'UploadProgress': function (up, file) {
                            console.log('上传中...');
                        },
                        'FileUploaded': function (up, file, info) {
                            window.eventHub.emit('afterUpload')
                            const res = JSON.parse(info.response);
                            const sourceLink = 'http://' + up.getOption('domain') + '/' + res.key;
                            console.log('上传完成！文件链接:', sourceLink);
                            window.eventHub.emit('new', {
                                url: sourceLink,
                                name: res.key
                            })
                        },
                        'Error': function (up, err, errTip) {
                            console.error('上传出错:', errTip);
                        },
                        'UploadComplete': function () {
                            console.log('队列文件处理完毕');
                        },
                    }
                });
            });
        }
    };
    controller.init(view, model);
}

