{
    let view = {
        el: '.songList-container',
        template: `
            <ul class="songList">
            </ul>
        `,
        render(data) {
            let $el = $(this.el);
            $el.html(this.template);
            let { songs, selectedSongId } = data;
            let liList = songs.map((song) => {
                let $li = $('<li></li>')
                    .text(song.name)
                    .attr('data-song-id', song.id);
                if (song.id === selectedSongId) {
                    $li.addClass('active');
                }
                return $li;
            });
            $el.find('ul').empty();
            liList.forEach((domLi) => {
                $el.find('ul').append(domLi);
            });
        },
        clearActive() {
            // 清除所有歌曲列表项的 'active' 样式
            $(this.el).find('li.active').removeClass('active');
        }
    };

    let model = {
        data: {
            songs: [],
            selectedSongId: undefined,
        },
        find() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return { id: song.id, ...song.attributes }
                })
                return songs
            })
        }
    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.bindEvents()
            this.bindEventHub()
            this.getAllSongs()
        },
        getAllSongs() {
            return this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                let songId = e.currentTarget.getAttribute('data-song-id')
                this.model.data.selectedSongId = songId
                this.view.render(this.model.data)
                let data
                let songs = this.model.data.songs
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === songId) {
                        data = songs[i]
                        break
                    }
                }
                window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))
            })
        },
        bindEventHub() {
            window.eventHub.on('create', (songData) => {
                this.model.data.songs.push(songData); // 添加新歌曲
                this.view.render(this.model.data);    // 更新视图
            });
            window.eventHub.on('new', () => {
                this.view.clearActive();              // 清除选中状态
            });
            window.eventHub.on('update', (updatedSong) => {
                let songs = this.model.data.songs;
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === updatedSong.id) {
                        Object.assign(songs[i], updatedSong); // 更新数据模型
                        break;
                    }
                }
                this.view.render(this.model.data); // 更新视图
            });
        }
    }
    controller.init(view, model);
}


