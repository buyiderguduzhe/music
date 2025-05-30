{
    let view = {
        el: '.page > main',
        init() {
            this.$el = $(this.el)
        },
        template: `
            <form class="form">
                <div class="row">
                    <label>
                    歌名
                    </label>
                    <input name="name" type="text" value="--name--">
                </div>
                <div class="row">
                    <label>
                    歌手
                    </label>
                    <input name="singer" type="text" value="--singer--">
                </div>
                <div class="row">
                    <label>
                    歌单
                    </label>
                    <input name="playlist" type="text" value="--playlist--">
                </div>
                <div class="row">
                    <label>
                    外链
                    </label>
                    <input name="url" type="text" value="--url--">
                </div>
                <div class="row">
                    <label>
                    封面
                    </label>
                    <input name="cover" type="text" value="--cover--">
                </div>
                <div class="row">
                    <label>
                    歌词
                    </label>
                    <textarea cols=100 rows=10 name="lyrics"></textarea>
                </div>
                <div class="row actions">
                    <button type="submit">保存</button>
                </div>
            </form>
            `,
        render(data = {}) {
            let placeholders = ['name', 'url', 'singer', 'id', 'cover', 'lyrics', 'playlist']
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`--${string}--`, data[string] || '')
            })
            $(this.el).html(html)
            if (data.id) {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset() {
            this.render({})
        }
    }
    let model = {
        data: {
            name: '', singer: '', url: '', id: '', cover: '', lyrics: '', playlist: '',
        },
        update(data) {
            var song = AV.Object.createWithoutData('Song', this.data.id);
            song.set('name', data.name);
            song.set('singer', data.singer);
            song.set('lyrics', data.lyrics);
            song.set('url', data.url);
            song.set('cover', data.cover);
            song.set('playlist', data.playlist);
            return song.save().then((response) => {
                Object.assign(this.data, data); // 更新数据模型
                return response;             // 返回更新后的歌曲对象
            });
        },
        create(data) {
            var Song = AV.Object.extend('Song');
            var song = new Song();
            song.set('name', data.name);
            song.set('singer', data.singer);
            song.set('lyrics', data.lyrics);
            song.set('url', data.url);
            song.set('cover', data.cover);
            song.set('playlist', data.playlist);
            return song.save().then((newSong) => {
                let { id, attributes } = newSong
                Object.assign(this.data, { id, ...attributes })
            }, (error) => {
                console.error(error);
            });
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.view.init()
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            window.eventHub.on('select', (data) => {
                this.model.data = data
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', (data) => {
                if (this.model.data.id) {
                    this.model.data = {
                        name: '', url: '', id: '', singer: '', lyrics: '', playlist: '',
                    }
                } else {
                    Object.assign(this.model.data, data)
                }
                this.view.render(this.model.data)
            })
        },
        create() {
            let needs = 'name singer url cover lyrics playlist'.split(' ')
            let data = {}
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.create(data)
                .then(() => {
                    this.view.reset()
                    let string = JSON.stringify(this.model.data)
                    let object = JSON.parse(string)
                    window.eventHub.emit('create', object) // 触发 'create' 事件
                })
        },
        update() {
            let needs = 'name singer url cover lyrics playlist'.split(' ')
            let data = {}
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.update(data)
                .then(() => {
                    window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data))) // 触发 'update' 事件
                })
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault()
                if (this.model.data.id) {
                    this.update()
                } else {
                    this.create()
                }
            })
        }
    }
    controller.init(view, model)
}



