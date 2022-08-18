import { useState } from "react";

import style from "../../styles/Intro.module.css";
import Conver from "./Conversation";

function Intro(props) {
  const [counter, setCounter] = useState(0);
  const [diagEnd, setDiagEnd] = useState(true);
  const [flag, setFlag] = useState(true);
  const [unskip, setSkip] = useState(true);

  function nextConv() {
    let ctrTemp = counter >= 10 ? 10 : counter + 1;
    ctrTemp == 10 ? setDiagEnd(false) : false;

    setFlag(false);

    setTimeout(function () {
      setCounter(ctrTemp);
      setFlag(true);
    }, 380);
  }

  function skip_fun() {
    setSkip(false);
  }

  return (
    counter != 10 &&
    unskip && (
      <Conver
        index={counter}
        css={flag}
        click={nextConv}
        skipClick={skip_fun}
        backgo={diagEnd}
      />
    )
  );
}

export default Intro;
