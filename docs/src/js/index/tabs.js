{
    let view = {
        el: '#tabs',
        init() {
            this.$el = $(this.el);
        }
    };

    let model = {};

    let controller = {
        // 移除了 eventBound 标志位
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.init();
            this.bindEvents(); // 仅在首次初始化时绑定事件
        },

        bindEvents() {
            // 直接绑定点击事件，不再使用 .off()
            this.view.$el.on('click', '.tabs-nav > li', (e) => {
                let $li = $(e.currentTarget);
                let tabName = $li.attr('data-tab-name');

                console.log('$li:', $li); // 调试信息
                console.log('tabName:', tabName); // 调试信息

                $li.addClass('active')
                    .siblings().removeClass('active');

                window.eventHub.emit('selectTab', tabName);
            });
        }
    };

    controller.init(view, model);
}