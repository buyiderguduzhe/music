{
    let view = {
        el: 'section.songs',
        template: `
        <li>
          <div>
            <h3>{{song.name}}</h3>
            <p>
              <svg class="icon icon-sq">
                <use xlink:href="#icon-sq"></use>
              </svg>
              {{song.singer}}
            </p>
          </div>
          <a class="playButton" href="./song.html?id={{song.id}}">
            <svg class="icon icon-play">
              <use xlink:href="#icon-play"></use>
            </svg>
          </a>
        </li>
      `,
        init() {
            this.$el = $(this.el);
        },
        render(data) {
            // 清空旧内容并渲染
            const $list = this.$el.find('ol.list').empty();

            data.songs.forEach((song) => {
                let $li = $(this.template
                    .replace('{{song.name}}', song.name)
                    .replace('{{song.singer}}', song.singer)
                    .replace('{{song.id}}', song.id)
                );
                $list.append($li);
            });
        }
    };

    let model = {
        data: {
            songs: []
        },
        find(playlistId) {
            // LeanCloud 查询条件：playlist 字段等于传入的 id（字符串）
            const query = new AV.Query('Song');
            query.equalTo('playlist', String(playlistId)); // 确保类型一致为 string
            return query.find().then(songs => {
                // 把 LeanCloud 返回的数据整理成更方便使用的格式
                this.data.songs = songs.map(song => ({
                    id: song.id,
                    ...song.attributes
                }));
                return songs;
            }).catch(error => {
                console.error('查询歌曲失败:', error);
            });
        }
    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.init();

            // 获取 URL 中的 id 参数
            const urlParams = new URLSearchParams(window.location.search);
            const playlistId = urlParams.get('id');

            if (!playlistId) {
                console.error('缺少歌单ID');
                return;
            }

            // 发起请求并渲染
            this.model.find(playlistId).then(() => {
                this.view.render(this.model.data);
            });
        }
    };

    controller.init(view, model);
}