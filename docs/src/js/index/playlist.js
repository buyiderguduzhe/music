{
    let view = {
        el: 'section.songs',
        template: `
            <li>
              <h3>{{song.name}}</h3>
              <p>
                <svg class="icon icon-sq">
                  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-sq"></use>
                </svg>
                {{song.singer}}
              </p>
              <a class="playButton" href="./song.html?id={{song.id}}">
                <svg class="icon icon-play">
                  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-play"></use>
                </svg>
              </a>
            </li>
      `,
        init() {
            this.$el = $(this.el);
        },
        render(data) {
            // 设置封面图片和简介
            document.getElementById('playlistCover').src = data.coverImageUrl || '';
            document.getElementById('playlistIntroduction').innerText = data.introduction || '';

            // 清空旧内容并渲染
            const $list = this.$el.find('ol.list').empty();

            data.songs.forEach((song) => {
                let $li = $(this.template
                    .replace('{{song.name}}', song.name)
                    .replace('{{song.singer}}', song.singer || '') // 如果没有歌手则为空字符串
                    .replace('{{song.id}}', song.id)
                );
                $list.append($li);
            });
        }
    };

    let model = {
        data: {
            songs: [],
            coverImageUrl: '',
            introduction: ''
        },
        find(playlistId) {
            // LeanCloud 查询条件：playlist 字段等于传入的 id（字符串）
            const query = new AV.Query('Song');
            query.equalTo('playlist', String(playlistId)); // 确保类型一致为 string

            // 另外查询歌单封面图片URL和简介
            const coverQuery = new AV.Query('Song');
            coverQuery.equalTo('playlist', String(playlistId));
            coverQuery.exists('picture'); // 只选择存在 picture 字段的记录
            coverQuery.limit(1); // 只需要一条记录来获取封面图片URL和简介

            return AV.Promise.all([query.find(), coverQuery.first()]).then(([songs, coverSong]) => {
                // 把 LeanCloud 返回的数据整理成更方便使用的格式
                this.data.songs = songs.map(song => ({
                    id: song.id,
                    ...song.attributes
                }));
                if (coverSong) {
                    this.data.coverImageUrl = coverSong.attributes.picture;
                    this.data.introduction = coverSong.attributes.introduction;
                }
                return { songs, coverSong };
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