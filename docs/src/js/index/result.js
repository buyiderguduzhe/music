let view = {
    el: 'section.songspage',
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
        let { songs } = data;
        this.$el.find('ol.list').empty();

        if (songs.length === 0) {
            this.$el.find('ol.list').append('<li>没有找到相关歌曲</li>');
            return;
        }

        songs.forEach((song) => {
            let $li = $(this.template
                .replace('{{song.name}}', song.name)
                .replace('{{song.singer}}', song.singer)
                .replace('{{song.id}}', song.id));
            this.$el.find('ol.list').append($li);
        });
    }
};

let model = {
    data: {
        songs: []
    },
    // 接收关键词，按条件查询
    search(queryText) {
        const query = new AV.Query('Song');
        // 使用 or 查询来同时匹配歌曲名和歌手名
        const songNameQuery = new AV.Query('Song');
        songNameQuery.contains('name', queryText);
        const singerQuery = new AV.Query('Song');
        singerQuery.contains('singer', queryText);

        const mainQuery = AV.Query.or(songNameQuery, singerQuery);

        return mainQuery.find().then((results) => {
            this.data.songs = results.map((song) => {
                return { id: song.id, ...song.attributes };
            });
        });
    }
};
let controller = {
    init(view, model) {
        this.view = view;
        this.model = model;
        this.view.init();

        // 获取 URL 中的 query 参数
        const urlParams = new URLSearchParams(window.location.search);
        const queryText = urlParams.get('query') || '';

        if (queryText) {
            this.model.search(queryText).then(() => {
                this.view.render(this.model.data);
            });
        } else {
            this.view.render({ songs: [] }); // 显示无结果提示
        }
    }
};

controller.init(view, model);