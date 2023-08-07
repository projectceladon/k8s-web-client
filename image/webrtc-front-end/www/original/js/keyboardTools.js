var KeyCode = {
    KEY_ESCAPE: "escape",
    KEY_1: "1",
    KEY_2: "2",
    KEY_3: "3",
    KEY_4: "4",
    KEY_5: "5",
    KEY_6: "6",
    KEY_7: "7",
    KEY_8: "8",
    KEY_9: "9",
    KEY_0: "0",
    KEY_MINUS: "-",
    KEY_EQUALS: "=",
    KEY_DEL: "backspace",
    KEY_TAB: "tab",
    KEY_Q: "q",
    KEY_W: "w",
    KEY_E: "e",
    KEY_R: "r",
    KEY_T: "t",
    KEY_Y: "y",
    KEY_U: "u",
    KEY_I: "i",
    KEY_O: "o",
    KEY_P: "p",
    KEY_LEFT_BRACKET: "[",
    KEY_RIGHT_BRACKET: "]",
    KEY_ENTER: "enter",
    KEY_CTRL: "control",
    KEY_A: "a",
    KEY_S: "s",
    KEY_D: "d",
    KEY_F: "f",
    KEY_G: "g",
    KEY_H: "h",
    KEY_J: "j",
    KEY_K: "k",
    KEY_L: "l",
    KEY_SEMICOLON: ";",
    KEY_APOSTROPHE: "'",
    KEY_GRAVE: "`",
    KEY_SHIFT: "shift",
    KEY_BACKSLASH: "\\",
    KEY_Z: "z",
    KEY_X: "x",
    KEY_C: "c",
    KEY_V: "v",
    KEY_B: "b",
    KEY_N: "n",
    KEY_M: "m",
    KEY_COMMA: ",",
    KEY_PEROID: ".",
    KEY_SLASH: "/",
    KEY_MULTIPLY: "*",
    KEY_ALT: "alt",
    KEY_SPACE: " ",
    KEY_CAPS_LOCK: "capslock",
    KEY_NUM_LOCK: "numlock",
    KEY_SCROLL_LOCK: "scrolllock",
    KEY_MOVE_HOME: "home",
    KEY_DPAD_UP: "arrowup",
    KEY_DPAD_LEFT: "arrowleft",
    KEY_DPAD_RIGHT: "arrowright",
    KEY_DPAD_DOWN: "arrowdown",
    KEY_PAGE_UP: "pageup",
    KEY_PAGE_DOWN: "pagedown",
    KEY_MOVE_END: "end",
    KEY_INSERT: "insert",
    KEY_FORWARD_DELETE: "delete",
    KEY_AT: "@",
    KEY_POUND: "#",
    KEY_EXCLAMATION: "!",
    KEY_DOLLAR: "$",
    KEY_PERCENT: "%",
    KEY_INSERT_SYMBOL: "^",
    KEY_AND: "&",
    KEY_LEFT_BRACKET_ROUND: "(",
    KEY_RIGHT_BRACKET_ROUND: ")",
    KEY_UNDERLINE: "_",
    KEY_PLUS: "+",
    KEY_LEFT_BRACKET_CURLY: "{",
    KEY_RIGHT_BRACKET_CURLY: "}",
    KEY_VERTICAL_SIGN: "|",
    KEY_COLON: ":",
    KEY_QUOTE: "\"",
    KEY_LEFT_BRACKET_ANGLE: "<",
    KEY_RIGHT_BRACKET_ANGLE: ">",
    KEY_QUESTION: "?",
    KEY_WAVE: "~"
  }
  
  function resolveKey(key, location) {
    var keyCode = '';
  
    switch (key.toLowerCase()) {
      case KeyCode.KEY_ESCAPE:
        keyCode = '1';
        break;
      case KeyCode.KEY_1:
      case KeyCode.KEY_EXCLAMATION:
        if (location == 0) {
          keyCode = '2';
        } else if (location == 3) {
          keyCode = '79';
        }
        break;
      case KeyCode.KEY_2:
      case KeyCode.KEY_AT:
        if (location == 0) {
          keyCode = '3';
        } else if (location == 3) {
          keyCode = '80';
        }
        break;
      case KeyCode.KEY_3:
      case KeyCode.KEY_POUND:
        if (location == 0) {
          keyCode = '4';
        } else if (location == 3) {
          keyCode = '81';
        }
        break;
      case KeyCode.KEY_4:
      case KeyCode.KEY_DOLLAR:
        if (location == 0) {
          keyCode = '5';
        } else if (location == 3) {
          keyCode = '75';
        }
        break;
      case KeyCode.KEY_5:
      case KeyCode.KEY_PERCENT:
        if (location == 0) {
          keyCode = '6';
        } else if (location == 3) {
          keyCode = '76';
        }
        break;
      case KeyCode.KEY_6:
      case KeyCode.KEY_INSERT_SYMBOL:
        if (location == 0) {
          keyCode = '7';
        } else if (location == 3) {
          keyCode = '77';
        }
        break;
      case KeyCode.KEY_7:
      case KeyCode.KEY_AND:
        if (location == 0) {
          keyCode = '8';
        } else if (location == 3) {
          keyCode = '71';
        }
        break;
      case KeyCode.KEY_8:
        if (location == 0) {
          keyCode = '9';
        } else if (location == 3) {
          keyCode = '72';
        }
        break;
      case KeyCode.KEY_9:
      case KeyCode.KEY_LEFT_BRACKET_ROUND:
        if (location == 0) {
          keyCode = '10';
        } else if (location == 3) {
          keyCode = '73';
        }
        break;
      case KeyCode.KEY_0:
      case KeyCode.KEY_RIGHT_BRACKET_ROUND:
        if (location == 0) {
          keyCode = '11';
        } else if (location == 3) {
          keyCode = '82';
        }
        break;
      case KeyCode.KEY_MINUS:
      case KeyCode.KEY_UNDERLINE:
        if (location == 0) {
          keyCode = '12';
        } else if (location == 3) {
          keyCode = '74';
        }
        break;
      case KeyCode.KEY_EQUALS:
      case KeyCode.KEY_PLUS:
        if (location == 0) {
          keyCode = '13';
        } else if (location == 3) {
          keyCode = '78';
        }
        break;
      case KeyCode.KEY_DEL:
        keyCode = '14';
        break;
      case KeyCode.KEY_TAB:
        keyCode = '15';
        break;
      case KeyCode.KEY_Q:
        keyCode = '16';
        break;
      case KeyCode.KEY_W:
        keyCode = '17';
        break;
      case KeyCode.KEY_E:
        keyCode = '18';
        break;
      case KeyCode.KEY_R:
        keyCode = '19';
        break;
      case KeyCode.KEY_T:
        keyCode = '20';
        break;
      case KeyCode.KEY_Y:
        keyCode = '21';
        break;
      case KeyCode.KEY_U:
        keyCode = '22';
        break;
      case KeyCode.KEY_I:
        keyCode = '23';
        break;
      case KeyCode.KEY_O:
        keyCode = '24';
        break;
      case KeyCode.KEY_P:
        keyCode = '25';
        break;
      case KeyCode.KEY_LEFT_BRACKET:
      case KeyCode.KEY_LEFT_BRACKET_CURLY:
        keyCode = '26';
        break;
      case KeyCode.KEY_RIGHT_BRACKET:
      case KeyCode.KEY_RIGHT_BRACKET_CURLY:
        keyCode = '27';
        break;
      case KeyCode.KEY_ENTER:
        if (location == 0) {
          keyCode = '28';
        } else if (location == 3) {
          keyCode = '96';
        }
        break;
      case KeyCode.KEY_CTRL:
        if (location == 1) {
          keyCode = '29';
        } else if (location == 2) {
          keyCode = '97';
        }
        break;
      case KeyCode.KEY_A:
        keyCode = '30';
        break;
      case KeyCode.KEY_S:
        keyCode = '31';
        break;
      case KeyCode.KEY_D:
        keyCode = '32';
        break;
      case KeyCode.KEY_F:
        keyCode = '33';
        break;
      case KeyCode.KEY_G:
        keyCode = '34';
        break;
      case KeyCode.KEY_H:
        keyCode = '35';
        break;
      case KeyCode.KEY_J:
        keyCode = '36';
        break;
      case KeyCode.KEY_K:
        keyCode = '37';
        break;
      case KeyCode.KEY_L:
        keyCode = '38';
        break;
      case KeyCode.KEY_SEMICOLON:
      case KeyCode.KEY_COLON:
        keyCode = '39';
        break;
      case KeyCode.KEY_APOSTROPHE:
      case KeyCode.KEY_QUOTE:
        keyCode = '40';
        break;
      case KeyCode.KEY_GRAVE:
      case KeyCode.KEY_WAVE:
        keyCode = '41';
        break;
      case KeyCode.KEY_SHIFT:
        if (location == 1) {
          keyCode = '42';
        } else if (location == 2) {
          keyCode = '54';
        }
        break;
      case KeyCode.KEY_BACKSLASH:
      case KeyCode.KEY_VERTICAL_SIGN:
        keyCode = '43';
        break;
      case KeyCode.KEY_Z:
        keyCode = '44';
        break;
      case KeyCode.KEY_X:
        keyCode = '45';
        break;
      case KeyCode.KEY_C:
        keyCode = '46';
        break;
      case KeyCode.KEY_V:
        keyCode = '47';
        break;
      case KeyCode.KEY_B:
        keyCode = '48';
        break;
      case KeyCode.KEY_N:
        keyCode = '49';
        break;
      case KeyCode.KEY_M:
        keyCode = '50';
        break;
      case KeyCode.KEY_COMMA:
      case KeyCode.KEY_LEFT_BRACKET_ANGLE:
        keyCode = '51';
        break;
      case KeyCode.KEY_PEROID:
      case KeyCode.KEY_RIGHT_BRACKET_ANGLE:
        if (location == 0) {
          keyCode = '52';
        } else if (location == 3) {
          keyCode = '83';
        }
        break;
      case KeyCode.KEY_SLASH:
      case KeyCode.KEY_QUESTION:
        if (location == 0) {
          keyCode = '53';
        } else if (location == 3) {
          keyCode = '98';
        }
        break;
      case KeyCode.KEY_MULTIPLY:
        keyCode = '55';
        break;
      case KeyCode.KEY_ALT:
        if (location == 1) {
          keyCode = '56';
        } else if (location == 2) {
          keyCode = '100';
        }
        break;
      case KeyCode.KEY_SPACE:
        keyCode = '57';
        break;
      case KeyCode.KEY_CAPS_LOCK:
        keyCode = '58';
        break;
      case KeyCode.KEY_NUM_LOCK:
        keyCode = '69';
        break;
      case KeyCode.KEY_SCROLL_LOCK:
        keyCode = '70';
        break;
      case KeyCode.KEY_MOVE_HOME:
        keyCode = '73';
        break;
      case KeyCode.KEY_DPAD_UP:
        keyCode = '103';
        break;
      case KeyCode.KEY_DPAD_LEFT:
        keyCode = '105';
        break;
      case KeyCode.KEY_DPAD_RIGHT:
        keyCode = '106';
        break;
      case KeyCode.KEY_DPAD_DOWN:
        keyCode = '108';
        break;
      case KeyCode.KEY_PAGE_UP:
        keyCode = '104';
        break;
      case KeyCode.KEY_PAGE_DOWN:
        keyCode = '109';
        break;
      case KeyCode.KEY_MOVE_END:
        keyCode = '107';
        break;
      case KeyCode.KEY_INSERT:
        keyCode = '110';
        break;
      case KeyCode.KEY_FORWARD_DELETE:
        keyCode = '111';
        break;
    }
  
    return keyCode;
  }