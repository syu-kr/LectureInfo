import * as fs from "fs"
import { js2xml, xml2json, xml2js } from "xml-js"

const getResponse = async () => {
  const requestXML = fs.readFileSync("./request.xml", "utf-8")
  const cookie = fs.readFileSync("./cookie.txt", "utf-8")

  const response = await fetch("https://suwings.syu.ac.kr/websquare/engine/proworks/callServletService.jsp", {
    method: "POST",
    body: requestXML,
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cookie": cookie,
    },
  })

  if (!response.ok) {
    response.text().then((text) => {
      throw new Error(text)
    })
  }

  const rawXML = await response.text()
  const rawJSON = xml2json(rawXML)

  fs.writeFile("./response.xml", rawXML, (err) => {
    if (err) {
      console.log(err)
    }
  })

  fs.writeFile("./response.json", JSON.stringify(JSON.parse(rawJSON), null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const getConvert = () => {
  const response = JSON.parse(fs.readFileSync("./response.json", "utf-8"))

  let infos: any = []

  for (let element of response["elements"]) {
    for (let elemen of element["elements"]) {
      for (let eleme of elemen["elements"]) {
        let info = {}
        let lectnum1 = ""
        let lectnum2 = ""
        let lecture = ""
        let college = ""
        let department = ""
        let grade = ""
        let part1 = ""
        let part2 = ""
        let credit = ""
        let professor = ""
        let timeplace = ""
        let time = ""
        let place = ""

        for (let elem of eleme["elements"]) {
          if (elem["name"] == "LECT_NO") lectnum1 = elem["attributes"]["value"]
          if (elem["name"] == "SBJT_CD") lectnum2 = elem["attributes"]["value"]
          if (elem["name"] == "SBJT_NM") lecture = elem["attributes"]["value"]
          if (elem["name"] == "COLG_CD") college = elem["attributes"]["value"]
          if (elem["name"] == "ORGN4_NM") department = elem["attributes"]["value"]
          if (elem["name"] == "EDUCUR_CORS_SHYS_CD") grade = elem["attributes"]["value"]
          if (elem["name"] == "CPTN_DIV_CD") part1 = elem["attributes"]["value"]
          if (elem["name"] == "CTNCCH_FLD_DIV_CD") part2 = elem["attributes"]["value"]
          if (elem["name"] == "LCTPT") credit = elem["attributes"]["value"]
          if (elem["name"] == "FNM") professor = elem["attributes"]["value"]
          if (elem["name"] == "LT_INFO") timeplace = elem["attributes"]["value"]
          if (elem["name"] == "LTTM") time = elem["attributes"]["value"]
          if (elem["name"] == "LT_ROOM_NM") place = elem["attributes"]["value"]
        }

        info = {
          "강좌번호": lectnum1,
          "과목코드": lectnum2,
          "과목명": lecture,
          "단과대학":
            college == "00101"
              ? "신학대학"
              : college == "00103"
              ? "인문사회대학"
              : college == "00112"
              ? "보건복지대학"
              : college == "00159"
              ? "간호대학"
              : college == "00121"
              ? "약학대학"
              : college == "00124"
              ? "과학기술대학"
              : college == "00126"
              ? "미래융합대학"
              : college == "00136"
              ? "문화예술대학"
              : college == "00191"
              ? "창의융합대학"
              : college,
          "학부(과)": department,
          "학년": grade,
          "이수구분":
            part1 == "11"
              ? "교양필수"
              : part1 == "12"
              ? "교양선택"
              : part1 == "22"
              ? "전공필수"
              : part1 == "23"
              ? "전공선택"
              : part1 == "61"
              ? "교직필수"
              : part1 == "71"
              ? "연계필수"
              : part1 == "72"
              ? "연계선택"
              : part1 == "99"
              ? "채플"
              : part1,
          "영역구분":
            part2 == "03"
              ? "사회과학영역"
              : part2 == "04"
              ? "자연과학영역"
              : part2 == "07"
              ? "일반선택영역"
              : part2 == "12"
              ? "인성영역"
              : part2 == "13"
              ? "기초영역"
              : part2 == "14"
              ? "핵심교양"
              : part2 == "15"
              ? "인문예술영역"
              : part2 == "16"
              ? "디지털 리터러시영역"
              : part2,
          "학점": credit,
          "교수명": professor,
          "수업시간/장소": timeplace,
          "수업시간": time,
          "장소": place,
          "비고": "",
          "팀티칭여부": "",
        }

        if (Object.keys(info).length != 0) infos.push(info)
      }
    }
  }

  const today = new Date()
  const year = today.getFullYear()
  const month = ("0" + (today.getMonth() + 1)).slice(-2)
  const day = ("0" + today.getDate()).slice(-2)
  const hours = ("0" + today.getHours()).slice(-2)
  const minutes = ("0" + today.getMinutes()).slice(-2)
  const seconds = ("0" + today.getSeconds()).slice(-2)
  const dateString = year + "-" + month + "-" + day
  const timeString = hours + ":" + minutes + ":" + seconds

  let convert = {
    "time": dateString + " " + timeString,
    "data": infos,
  }

  fs.writeFile("./convert.json", JSON.stringify(convert, null, 2), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

getResponse()

delay(4000).then(() => {
  getConvert()
})
