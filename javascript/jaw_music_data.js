/**
 * JAWMusicLib Data
 * 音乐库数据存储
 */

const JAWMusicData = {
  "songs": [
    {
      "id": "canon_in_d",
      "titles": [
        "Canon in D",
        "D大调卡农",
        "卡农"
      ],
      "creators": [
        {
          "name": "Johann Pachelbel",
          "aliases": ["Pachelbel", "帕赫贝尔", "巴赫贝尔"]
        },
        {
          "name": "中国爱乐乐团",
          "aliases": ["China Philharmonic Orchestra"]
        },
        {
          "name": "瑞鸣音乐"
        }
      ],
      "relatedInfo": ["古典音乐"],
      "path": "/music/canon_in_d/",
      "audioPath": "/file_storage/music/卡农（弦乐四重奏） - 中国爱乐乐团,瑞鸣音乐.mp3"
    },
    {
      "id": "moon_halo",
      "titles": [
        "Moon Halo",
        "月晕"
      ],
      "extraInfo": "崩坏3动画短片《薪炎永燃》主题曲",
      "creators": [
        {
          "name": "茶理理",
          "aliases": ["Chalili", "茶理理理子"]
        },
        {
          "name": "hanser"
        },
        {
          "name": "TetraCalyx"
        },
        {
          "name": "HOYO-MiX"
        }
      ],
      "relatedInfo": [
        "崩坏3",
        "薪炎永燃",
        "动画短片配乐",
        "Honkai Impact 3rd"
      ],
      "path": "/music/moon_halo/",
      "audioPath": "https://music.163.com/song/media/outer/url?id=1859652717.mp3"
    },
    {
      "id": "da_capo",
      "titles": [
        "Da Capo",
        "返始"
      ],
      "extraInfo": "崩坏3动画短片《毕业旅行》主题曲",
      "creators": [
        {
          "name": "车子玉Ziyu Che(HOYO-MiX)"
        },
        {
          "name": "HOYO-MiX"
        }
      ],
      "relatedInfo": [
        "崩坏3",
        "毕业旅行",
        "动画短片配乐",
        "Honkai Impact 3rd"
      ],
      "path": "/music/da_capo/",
      "audioPath": "https://music.163.com/song/media/outer/url?id=2026565329.mp3"
    },
    {
      "id": "da_capo_instrumental",
      "titles": [
        "Da Capo (Instrumental)",
        "Da Capo (伴奏)",
        "返始 (伴奏)"
      ],
      "extraInfo": "崩坏3动画短片《毕业旅行》主题曲伴奏",
      "creators": [
        {
          "name": "HOYO-MiX"
        }
      ],
      "relatedInfo": [
        "崩坏3",
        "毕业旅行",
        "动画短片配乐",
        "Honkai Impact 3rd",
        "Instrumental",
        "伴奏"
      ],
      "path": "/music/da_capo_instrumental/",
      "audioPath": "https://music.163.com/song/media/outer/url?id=2026571661.mp3"
    }
  ]
};

// 如果在Node.js环境中使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAWMusicData;
}