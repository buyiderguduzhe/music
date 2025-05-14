{
    let view = {
        el: '.page-2',
        init() {
            this.$el = $(this.el);
        },
        show() {
            this.$el.addClass('active');
        },
        hide() {
            this.$el.removeClass('active');
        }
    };

    let model = {};

    let controller = {
        // 添加了 moduleLoaded 标志位
        moduleLoaded: false,

        init(view, model) {
            this.view = view;
            this.view.init();
            this.model = model;
            this.bindEventHub();
        },

        bindEventHub() {
            window.eventHub.on('selectTab', (tabName) => {
                if (tabName === 'page-2') {
                    this.view.show();
                    if (!this.moduleLoaded) {
                        this.loadModule();
                    }
                } else {
                    this.view.hide();
                }
            });
        },

        loadModule() {
            let script = document.createElement('script');
            script.src = 'src/js/index/page-2-1.js';
            script.onload = () => {
                console.log('page-2-1.js 加载完毕');
                this.moduleLoaded = true; // 模块加载后设置标志位
            };
            document.body.appendChild(script);
        }
    };

    controller.init(view, model);
}