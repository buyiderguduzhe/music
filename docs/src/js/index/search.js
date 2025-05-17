document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestionsBox');

    // 实时搜索建议
    searchInput.addEventListener('input', function (e) {
        const queryText = e.target.value.trim();

        if (!queryText) {
            suggestionsBox.innerHTML = '';
            return;
        }

        const query = new AV.Query('Song');
        // 使用 or 查询来同时匹配歌曲名和歌手名
        const songNameQuery = new AV.Query('Song');
        songNameQuery.contains('name', queryText);
        const singerQuery = new AV.Query('Song');
        singerQuery.contains('singer', queryText);

        const mainQuery = AV.Query.or(songNameQuery, singerQuery);
        mainQuery.limit(10);

        mainQuery.find().then(function (results) {
            suggestionsBox.innerHTML = '';
            results.forEach(song => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerText = `${song.get('name')} - ${song.get('singer')}`;
                suggestionsBox.appendChild(div);
            });
        }).catch(console.error);
    });

    // 回车键触发跳转
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const queryText = e.target.value.trim();
            if (queryText) {
                window.location.href = `result.html?query=${encodeURIComponent(queryText)}`;
            }
        }
    });

    // 点击建议项跳转
    suggestionsBox.addEventListener('click', function (e) {
        if (e.target.classList.contains('suggestion-item')) {
            const selectedSongInfo = e.target.innerText;
            const queryText = selectedSongInfo.split(' - ')[0]; // 假设格式为 "歌曲名 - 歌手名"
            window.location.href = `result.html?query=${encodeURIComponent(queryText)}`;
        }
    });
});