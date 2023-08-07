import { Tabs, TabList, Tab, TabPanels, TabPanel, IconButton, Spacer } from "@chakra-ui/react";
import React from "react";
import { BsArrowsFullscreen } from "react-icons/bs";
import { ImVolumeMedium, ImVolumeMute2 } from "react-icons/im";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { finalHeight } from "../pages/android-image";
import { TermainlBody } from "./terminal";
import { ANDROID_LOG, LOG_CAT, SHELL, STREAMER_LOG } from "../services/apis";
import { FileUpload } from "./file-upload";
import { AdbForward } from "./adb-forward";

export function ImageControl(
  props: { setHeight: React.Dispatch<React.SetStateAction<number>>; podRunning: boolean }
): React.ReactElement {
  const { setHeight, podRunning } = props;
  const video = document.getElementsByTagName("video")[0];

  const [panelheight, setPanelHeight] = React.useState(0);
  const [mute, setMute] = React.useState(video?.muted ?? video?.muted);
  const handleMute = (): void => {
    video.muted = !video.muted;
    setMute(video.muted);
  };

  const handleFullScreen = (): void => {
    video.requestFullscreen();
  };

  const handleTabChange = (): void => {
    if (panelheight !== document.body.clientHeight - 300 && panelheight === 0) {
      finalHeight.next(document.body.clientHeight - 300);
      setHeight(document.body.clientHeight - 300);
    } else {
      finalHeight.next(panelheight);
    }
  }; AiOutlineUp;

  React.useEffect((): void | (() => void | undefined) => {
    const sub = finalHeight.subscribe({
      next: setPanelHeight,
      error: (e): void => console.error(e)
    });

    return (): void => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <Tabs isLazy={true} lazyBehavior="unmount" onChange={handleTabChange}>
      <TabList alignItems="center">
        <Tab>Init</Tab>
        <Tab>Streamer log</Tab>
        <Tab>Android log</Tab>
        <Tab>Logcat</Tab>
        {podRunning
          && <>
            <Tab>Shell</Tab>
            <Tab>File</Tab>
            <Tab>ADB forward</Tab>
          </>
        }
        <Spacer />
        {panelheight === 0
          ? <IconButton size="sm" mr={2} aria-label="Full screen" icon={<AiOutlineUp />} onClick={(): void => {
            setHeight(document.body.clientHeight - 300);
            finalHeight.next(document.body.clientHeight - 300);
          }} />
          : <IconButton size="sm" mr={2} aria-label="Full screen" icon={<AiOutlineDown />} onClick={(): void => {
            setHeight(document.body.clientHeight - 118);
            finalHeight.next(0);
          }} />}
        <IconButton
          size="sm"
          mr={2}
          aria-label="Mute"
          icon={mute ? <ImVolumeMute2 /> : <ImVolumeMedium />}
          onClick={handleMute}
        />
        <IconButton size="sm" mr={2} aria-label="Full screen" icon={<BsArrowsFullscreen />} onClick={handleFullScreen} />
      </TabList>

      <TabPanels overflow="hidden" h={panelheight}>
        <TabPanel overflow="hidden" h={panelheight}>
          <></>
        </TabPanel>
        <TabPanel bg="black" overflow="hidden" p="-1rem" h={panelheight}>
          <TermainlBody api={STREAMER_LOG} updateHeight={panelheight} />
        </TabPanel>
        <TabPanel bg="black" overflow="hidden" p="-1rem" h={panelheight}>
          <TermainlBody api={ANDROID_LOG} updateHeight={panelheight} />
        </TabPanel>
        <TabPanel bg="black" overflow="hidden" p="-1rem" h={panelheight}>
          <TermainlBody api={LOG_CAT} updateHeight={panelheight} />
        </TabPanel>
        <TabPanel bg="black" overflow="hidden" p="-1rem" h={panelheight}>
          <TermainlBody api={SHELL} updateHeight={panelheight} />
        </TabPanel>
        <TabPanel overflow="hidden" h={panelheight}>
          <FileUpload />
        </TabPanel>
        <TabPanel overflow="hidden" h={panelheight}>
          <AdbForward />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
