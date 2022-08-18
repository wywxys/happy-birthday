import Head from "next/head";
import React, { useState, useEffect } from "react";

import Intro from "./components/Intro";
import Game from "./components/Game";

export default function Home() {
  return (
    <div>
      <Head>
        <title>云宝生日快乐捏😘</title>
        <link rel="icon" href="cloud.svg" />
      </Head>

      <Game />
      <Intro />
    </div>
  );
}
