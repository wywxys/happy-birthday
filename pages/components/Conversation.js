import Image from "next/image";
import style from "../../styles/Intro.module.css";

import speaker_shan from "../../public/shan.png";
import speaker_yun from "../../public/yun.png";

function Conver(props) {
  const conv = [
    "杉：可爱的云宝你好，今天是你一年一度的生日，为此我准备了许多蛋糕。",
    "杉：勇敢向前跳跃，然后尽力吃下蛋糕吧！",
    "云：我该怎么操作呢？",
    "杉：点击屏幕，会使角色云宝向上跳跃一段距离，蛋糕会从右侧来袭。",
    "云：为什么一定是蛋糕呢？",
    "杉：因为我实在想不出来写什么小游戏了，凑活吃吧。",
    "杉：但要记住，漏掉杉杉准备的蛋糕，会受到制裁捏。",
    "云：怎么制裁？",
    "杉：漏掉就游戏结束了捏。多说无益，开始你的旅途吧少女！",
    "杉：对话框结束后点击屏幕开始游戏捏~",
    "end",
  ];

  const speakers = [
    speaker_shan,
    speaker_shan,
    speaker_yun,
    speaker_shan,
    speaker_yun,
    speaker_shan,
    speaker_shan,
    speaker_yun,
    speaker_shan,
    speaker_shan,
  ];

  return (
    <div className={props.backgo ? style.back : style.back_hide}>
      <div className={props.css ? style.speaker_show : style.speaker_hide}>
        <Image src={speakers[props.index]} alt="shan" />
      </div>

      <div className={style.dialBack} onClick={props.click}>
        <p className={props.css ? style.dial_show : style.dial_hide}>
          {conv[props.index]}
        </p>
      </div>

      <button herf="/game" className={style.skip} onClick={props.skipClick}>
        跳过
      </button>
    </div>
  );
}

export default Conver;
