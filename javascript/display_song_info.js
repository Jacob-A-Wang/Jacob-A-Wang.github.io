function displaySongInfo(info) {
    const songInfoDiv = document.getElementById('songInfo');
    if (!info) {
        songInfoDiv.innerHTML = '<p>未找到歌曲信息</p>';
        return;
    }

    const titleHtml = `
        <div class="music-title" style="display: flex; align-items: center; gap: 8px;">
            <div class="primary-title">${info.primaryTitle}</div>
            ${info.extraInfo && info.extraInfo.length > 0 ? `<div class="extra-info" style="color: gray; font-size: 0.8em;">（${info.extraInfo}）</div>` : ''}
        </div>
        <div class="alt-titles">别名: ${info.titles.slice(1).join(' / ') || '无'}</div>
        <div class="music-creators">
            ${info.creators.map(c => 
                c.aliases && c.aliases.length > 0 ? 
                `${c.name} (${c.aliases.join(' / ')})` : 
                c.name
            ).join(', ')}
        </div>
        <div class="music-related">
            相关信息: ${info.relatedInfo.join(' | ')}
        </div>
    `;

    songInfoDiv.innerHTML = titleHtml;
}