export const HANBIN_DATA = {
  botName: "HANBIN TRACKER",
  // Nova lista de categorias
  categories: [
    "Boy Group", 
    "Girl Group", 
    "Soloists", 
    "Co-Ed", 
    "Duos", 
    "Survival Shows", 
    "Radiant", 
    "Events", 
    "Limiteds"
  ],
  rarities: [1, 2, 3, 4, 5],
  upcoming: [
    { group: "STRAY KIDS", info: "Ate - Set 4 Release" },
    { group: "AESPA", info: "Whiplash Concept Photos" },
    { group: "NCT DREAM", info: "New Limited Event" }
  ],
  groups: [
    {
  name: "STRAY KIDS",
  code: "SKZ",
  category: "Boy Group",
  banner: "https://link-da-foto-do-grupo.png",
  maxSet: 3.2, // Set 3 até a raridade 2H
  members: [
    { 
      name: "Bang Chan", code: "BC",
      links: {
        s1h1: "https://i.imgur.com/qlY9f5o.png", s1h2: "https://i.imgur.com/FeS3Q31.png", s1h3: "https://i.imgur.com/0O19dom.png", s1h4: "https://i.imgur.com/4zstXnF.png", s1h5: "https://i.imgur.com/oSwI2Ao.png",
        s2h1: "https://i.imgur.com/03vAdgO.png", s2h2: "https://i.imgur.com/0w6qX3A.png", s2h3: "https://i.imgur.com/GnNG88R.png", s2h4: "https://i.imgur.com/SOD9B6z.png", s2h5: "https://i.imgur.com/0Y1UGiA.png",
        s3h1: "https://i.imgur.com/7M8Tj55.png", s3h2: "https://i.imgur.com/51GhTqM.png"
      }
    },
    { 
      name: "Lee Know", code: "MH",
      links: {
        s1h1: "https://i.imgur.com/cJvmM9g.png", s1h2: "https://i.imgur.com/FAW6Ox5.png", s1h3: "https://i.imgur.com/bi81M2M.png", s1h4: "https://i.imgur.com/ZFR1YLo.png", s1h5: "https://i.imgur.com/UrKFOIe.png",
        s2h1: "https://i.imgur.com/m36PLJ5.png", s2h2: "https://i.imgur.com/K0r9TdK.png", s2h3: "https://i.imgur.com/Kl8ofmG.png", s2h4: "https://i.imgur.com/cqmP6ac.png", s2h5: "https://i.imgur.com/uDvSxxw.png",
        s3h1: "https://i.imgur.com/feUpXiu.png", s3h2: "https://i.imgur.com/vV13f6F.png"
      }
    },
    { 
      name: "Changbin", code: "CB",
      links: {
        s1h1: "https://i.imgur.com/t3o3MCm.png", s1h2: "https://i.imgur.com/Rzq2KKH.png", s1h3: "https://i.imgur.com/ghLj9Zq.png", s1h4: "https://i.imgur.com/bRIB9D5.png", s1h5: "https://i.imgur.com/8MNb5Q3.png",
        s2h1: "https://i.imgur.com/xQPhECu.png", s2h2: "https://i.imgur.com/hc6Zg7R.png", s2h3: "https://i.imgur.com/vVhIlCc.png", s2h4: "https://i.imgur.com/sIHnDnw.png", s2h5: "https://i.imgur.com/IuvRku5.png",
        s3h1: "https://i.imgur.com/EZJprgZ.png", s3h2: "https://i.imgur.com/vKNPCIe.png"
      }
    },
    { 
      name: "Hyunjin", code: "HJ",
      links: {
        s1h1: "https://i.imgur.com/wVHbynF.png", s1h2: "https://i.imgur.com/NOq3oDg.png", s1h3: "https://i.imgur.com/pVIfyQs.png", s1h4: "https://i.imgur.com/FyKVokv.png", s1h5: "https://i.imgur.com/CNiwh5C.png",
        s2h1: "https://i.imgur.com/VRRBYVM.png", s2h2: "https://i.imgur.com/fd3Fu7x.png", s2h3: "https://i.imgur.com/WRdlRo3.png", s2h4: "https://i.imgur.com/oMon5N3.png", s2h5: "https://i.imgur.com/I522pun.png",
        s3h1: "https://i.imgur.com/5R8dVYJ.png", s3h2: "https://i.imgur.com/NiHQbMO.png"
      }
    },
    { 
      name: "Han", code: "JS",
      links: {
        s1h1: "https://i.imgur.com/98Esz23.png", s1h2: "https://i.imgur.com/MJTN2wU.png", s1h3: "https://i.imgur.com/jrowcD7.png", s1h4: "https://i.imgur.com/vxikRmO.png", s1h5: "https://i.imgur.com/642liwX.png",
        s2h1: "https://i.imgur.com/w5Q2SCm.png", s2h2: "https://i.imgur.com/ZZXZiae.png", s2h3: "https://i.imgur.com/WubJGYb.png", s2h4: "https://i.imgur.com/nlaKx6Y.png", s2h5: "https://i.imgur.com/hxJAHp6.png",
        s3h1: "https://i.imgur.com/jFrlfIy.png", s3h2: "https://i.imgur.com/mTwef0V.png"
      }
    },
    { 
      name: "Felix", code: "FL",
      links: {
        s1h1: "https://i.imgur.com/B12uCnu.png", s1h2: "https://i.imgur.com/99KqZka.png", s1h3: "https://i.imgur.com/uyZWCPq.png", s1h4: "https://i.imgur.com/n22MQT7.png", s1h5: "https://i.imgur.com/KxVtneV.png",
        s2h1: "https://i.imgur.com/33R9raf.png", s2h2: "https://i.imgur.com/e1rtY73.png", s2h3: "https://i.imgur.com/LgctQNJ.png", s2h4: "https://i.imgur.com/rgIVifu.png", s2h5: "https://i.imgur.com/YXpFbkT.png",
        s3h1: "https://i.imgur.com/H51OfHQ.png", s3h2: "https://i.imgur.com/fRapSR4.png"
      }
    },
    { 
      name: "Seungmin", code: "SM",
      links: {
        s1h1: "https://i.imgur.com/55d21X4.png", s1h2: "https://i.imgur.com/9xy7Wl5.png", s1h3: "https://i.imgur.com/uszM69N.png", s1h4: "https://i.imgur.com/7XDZeii.png", s1h5: "https://i.imgur.com/kWjw3Wi.png",
        s2h1: "https://i.imgur.com/0B7WHD7.png", s2h2: "https://i.imgur.com/lllHZNB.png", s2h3: "https://i.imgur.com/Uzy4NOB.png", s2h4: "https://i.imgur.com/cXY0X4g.png", s2h5: "https://i.imgur.com/so7ORnJ.png",
        s3h1: "https://i.imgur.com/iJNLJAs.png", s3h2: "https://i.imgur.com/UtNUimI.png"
      }
    },
    { 
      name: "I.N", code: "JI",
      links: {
        s1h1: "https://i.imgur.com/MdJomKD.png", s1h2: "https://i.imgur.com/nt7ZkWO.png", s1h3: "https://i.imgur.com/g0zumcE.png", s1h4: "https://i.imgur.com/aMsRyOD.png", s1h5: "https://i.imgur.com/SGMJeVp.png",
        s2h1: "https://i.imgur.com/OcsSIzj.png", s2h2: "https://i.imgur.com/VzFqsil.png", s2h3: "https://i.imgur.com/SfimUN1.png", s2h4: "https://i.imgur.com/WRYB56L.png", s2h5: "https://i.imgur.com/3ck8PhU.png",
        s3h1: "https://i.imgur.com/3Fu9Sg3.png", s3h2: "https://i.imgur.com/AETN6th.png"
      }
    }
  ]
},
{
  name: "TWICE",
  code: "TWC",
  category: "Girlgroups",
  maxSet: 3.2, // Set 3 até a raridade 2H (Cartas 011 e 012)
  banner: "https://i.imgur.com/XF9Qn7s.jpeg", // Link de exemplo, você pode trocar
  members: [
    { 
      name: "Jihyo", code: "JH",
      links: {
        s1h1: "https://i.imgur.com/hiB3oXJ.png", s1h2: "https://i.imgur.com/h26zvVk.png", s1h3: "https://i.imgur.com/vYICvFz.png", s1h4: "https://i.imgur.com/80CyzyW.png", s1h5: "https://i.imgur.com/cTQnDfI.png",
        s2h1: "https://i.imgur.com/Qz8mgfN.png", s2h2: "https://i.imgur.com/JB1zASU.png", s2h3: "https://i.imgur.com/pvzGd0s.png", s2h4: "https://i.imgur.com/7ov1lU6.png", s2h5: "https://i.imgur.com/ctXzzE8.png",
        s3h1: "https://i.imgur.com/Tnmb5jV.png", s3h2: "https://i.imgur.com/wvxCrW6.png"
      }
    },
    { 
      name: "Nayeon", code: "NY",
      links: {
        s1h1: "https://i.imgur.com/og6MdJA.png", s1h2: "https://i.imgur.com/6vfusxp.png", s1h3: "https://i.imgur.com/H9PAaga.png", s1h4: "https://i.imgur.com/xotdJbO.png", s1h5: "https://i.imgur.com/AtxU1g8.png",
        s2h1: "https://i.imgur.com/viL1YML.png", s2h2: "https://i.imgur.com/jEaQRI4.png", s2h3: "https://i.imgur.com/RPjKXKe.png", s2h4: "https://i.imgur.com/fR5KBuL.png", s2h5: "https://i.imgur.com/fEf7gq5.png",
        s3h1: "https://i.imgur.com/ReXXade.png", s3h2: "https://i.imgur.com/31sbDBL.png"
      }
    },
    { 
      name: "Jeongyeon", code: "JY",
      links: {
        s1h1: "https://i.imgur.com/yUK2vt1.png", s1h2: "https://i.imgur.com/1Oj8IXz.png", s1h3: "https://i.imgur.com/OnnxhkA.png", s1h4: "https://i.imgur.com/lypczxe.png", s1h5: "https://i.imgur.com/ghWPxz8.png",
        s2h1: "https://i.imgur.com/q23UPsw.png", s2h2: "https://i.imgur.com/YQnkGMw.png", s2h3: "https://i.imgur.com/cXfZ0FU.png", s2h4: "https://i.imgur.com/TQoQkXl.png", s2h5: "https://i.imgur.com/kFAc7op.png",
        s3h1: "https://i.imgur.com/GwVR2wi.png", s3h2: "https://i.imgur.com/ioiG61h.png"
      }
    },
    { 
      name: "Momo", code: "MO",
      links: {
        s1h1: "https://i.imgur.com/ny0gN08.png", s1h2: "https://i.imgur.com/Hic7tqU.png", s1h3: "https://i.imgur.com/R7jrcVK.png", s1h4: "https://i.imgur.com/CHVtGrD.png", s1h5: "https://i.imgur.com/uVMvEnf.png",
        s2h1: "https://i.imgur.com/PahrTLA.png", s2h2: "https://i.imgur.com/uaQHdxv.png", s2h3: "https://i.imgur.com/D4Crdui.png", s2h4: "https://i.imgur.com/2lgzxIz.png", s2h5: "https://i.imgur.com/7ZEj920.png",
        s3h1: "https://i.imgur.com/3YMmlvw.png", s3h2: "https://i.imgur.com/wpplYvo.png"
      }
    },
    { 
      name: "Sana", code: "SN",
      links: {
        s1h1: "https://i.imgur.com/HFhVjhI.png", s1h2: "https://i.imgur.com/ucIE59z.png", s1h3: "https://i.imgur.com/fk9gfRf.png", s1h4: "https://i.imgur.com/cmCkCBu.png", s1h5: "https://i.imgur.com/dlyOUrT.png",
        s2h1: "https://i.imgur.com/BIPLwIX.png", s2h2: "https://i.imgur.com/9M4bmOr.png", s2h3: "https://i.imgur.com/QLdeI1o.png", s2h4: "https://i.imgur.com/X4nBAKi.png", s2h5: "https://i.imgur.com/DkLoo3x.png",
        s3h1: "https://i.imgur.com/GvYWoEJ.png", s3h2: "https://i.imgur.com/qhOjtqj.png"
      }
    },
    { 
      name: "Mina", code: "MN",
      links: {
        s1h1: "https://i.imgur.com/hUkltty.png", s1h2: "https://i.imgur.com/LVRnMr3.png", s1h3: "https://i.imgur.com/2zijp7R.png", s1h4: "https://i.imgur.com/rqyPF3G.png", s1h5: "https://i.imgur.com/YPNMD2b.png",
        s2h1: "https://i.imgur.com/xB5SaHM.png", s2h2: "https://i.imgur.com/PtK5oTy.png", s2h3: "https://i.imgur.com/hopGzjU.png", s2h4: "https://i.imgur.com/AHzQ42q.png", s2h5: "https://i.imgur.com/ZLhYS24.png",
        s3h1: "https://i.imgur.com/F6cSS0D.png", s3h2: "https://i.imgur.com/MmuQxNX.png"
      }
    },
    { 
      name: "Dahyun", code: "DH",
      links: {
        s1h1: "https://i.imgur.com/gjNHxQD.png", s1h2: "https://i.imgur.com/n52rmga.png", s1h3: "https://i.imgur.com/N4uLiAr.png", s1h4: "https://i.imgur.com/Ko3c3Rz.png", s1h5: "https://i.imgur.com/m3VqMPq.png",
        s2h1: "https://i.imgur.com/gJ1JiWJ.png", s2h2: "https://i.imgur.com/79nwwWS.png", s2h3: "https://i.imgur.com/E1cECXC.png", s2h4: "https://i.imgur.com/CJvy8sd.png", s2h5: "https://i.imgur.com/BgD3uNN.png",
        s3h1: "https://i.imgur.com/VUoKSqD.png", s3h2: "https://i.imgur.com/ZzFI2E8.png"
      }
    },
    { 
      name: "Chaeyoung", code: "CY",
      links: {
        s1h1: "https://i.imgur.com/J0HWvnf.png", s1h2: "https://i.imgur.com/UkhnpxK.png", s1h3: "https://i.imgur.com/yYbDUX5.png", s1h4: "https://i.imgur.com/AiVUTF7.png", s1h5: "https://i.imgur.com/l5FrXOw.png",
        s2h1: "https://i.imgur.com/Zkqmo1N.png", s2h2: "https://i.imgur.com/mUQVhUr.png", s2h3: "https://i.imgur.com/tYopJy3.png", s2h4: "https://i.imgur.com/obKwR5v.png", s2h5: "https://i.imgur.com/AjYJ4Or.png",
        s3h1: "https://i.imgur.com/nQDPqYh.png", s3h2: "https://i.imgur.com/hlSEqqK.png"
      }
    },
    { 
      name: "Tzuyu", code: "TZ",
      links: {
        s1h1: "https://i.imgur.com/XMqBAzw.png", s1h2: "https://i.imgur.com/Z9z3aBc.png", s1h3: "https://i.imgur.com/KXt3y8A.png", s1h4: "https://i.imgur.com/0aTV6Sz.png", s1h5: "https://i.imgur.com/x9v1xI0.png",
        s2h1: "https://i.imgur.com/BP0JcPW.png", s2h2: "https://i.imgur.com/j5ebPhL.png", s2h3: "https://i.imgur.com/j0YoFXV.png", s2h4: "https://i.imgur.com/0mR89br.png", s2h5: "https://i.imgur.com/PJxS7Yi.png",
        s3h1: "https://i.imgur.com/S46JHxr.png", s3h2: "https://i.imgur.com/g539sEA.png"
      }
    }
  ]
},

{
  name: "ZEROBASEONE",
  code: "ZB1",
  category: "Boygroups",
  maxSet: 3.2,
  banner: "https://i.imgur.com/7oH7kXq.jpeg", // Link de exemplo
  members: [
    { 
      name: "Hanbin", code: "HB",
      links: {
        s1h1: "https://i.imgur.com/B4yiizT.png", s1h2: "https://i.imgur.com/w3F5AWq.png", s1h3: "https://i.imgur.com/whzx2HG.png", s1h4: "https://i.imgur.com/7vyELH0.png", s1h5: "https://i.imgur.com/jinM87i.png",
        s2h1: "https://i.imgur.com/z8wcmOR.png", s2h2: "https://i.imgur.com/j6JcGck.png", s2h3: "https://i.imgur.com/mkLBJpm.png", s2h4: "https://i.imgur.com/7vN9IBH.png", s2h5: "https://i.imgur.com/QKLyYZC.png",
        s3h1: "https://i.imgur.com/cFloyrV.png", s3h2: "https://i.imgur.com/lKQ6N9A.png"
      }
    },
    { 
      name: "Jiwoong", code: "JW",
      links: {
        s1h1: "https://i.imgur.com/at29y1Z.png", s1h2: "https://i.imgur.com/hBra1u5.png", s1h3: "https://i.imgur.com/QBiyZ5r.png", s1h4: "https://i.imgur.com/96GodkZ.png", s1h5: "https://i.imgur.com/1lmhDk0.png",
        s2h1: "https://i.imgur.com/1Nmm7CC.png", s2h2: "https://i.imgur.com/MI8NYg1.png", s2h3: "https://i.imgur.com/ZzBVuhQ.png", s2h4: "https://i.imgur.com/fzI85QF.png", s2h5: "https://i.imgur.com/VGiQiLw.png",
        s3h1: "https://i.imgur.com/2xue4GJ.png", s3h2: "https://i.imgur.com/SWVGpK9.png"
      }
    },
    { 
      name: "Zhang Hao", code: "ZH",
      links: {
        s1h1: "https://i.imgur.com/a6YHMDW.png", s1h2: "https://i.imgur.com/Um91yYL.png", s1h3: "https://i.imgur.com/tJ9dNSr.png", s1h4: "https://i.imgur.com/TcVItuG.png", s1h5: "https://i.imgur.com/JxAAacC.png",
        s2h1: "https://i.imgur.com/2Zyk3En.png", s2h2: "https://i.imgur.com/JWiONgT.png", s2h3: "https://i.imgur.com/DUQYkNZ.png", s2h4: "https://i.imgur.com/tULaw1f.png", s2h5: "https://i.imgur.com/QtUGAs8.png",
        s3h1: "https://i.imgur.com/5V2cloh.png", s3h2: "https://i.imgur.com/ufRsZ7F.png"
      }
    },
    { 
      name: "Matthew", code: "MT",
      links: {
        s1h1: "https://i.imgur.com/zRLM2QA.png", s1h2: "https://i.imgur.com/4ktC8qj.png", s1h3: "https://i.imgur.com/3Y6UiOf.png", s1h4: "https://i.imgur.com/uLmCo4i.png", s1h5: "https://i.imgur.com/49J2rAP.png",
        s2h1: "https://i.imgur.com/ts4k0DY.png", s2h2: "https://i.imgur.com/d8XAd2f.png", s2h3: "https://i.imgur.com/gmkq19P.png", s2h4: "https://i.imgur.com/scrJiac.png", s2h5: "https://i.imgur.com/tfJhWBd.png",
        s3h1: "https://i.imgur.com/CiROvG8.png", s3h2: "https://i.imgur.com/REheiRD.png"
      }
    },
    { 
      name: "Taerae", code: "TR",
      links: {
        s1h1: "https://i.imgur.com/wm4nuqp.png", s1h2: "https://i.imgur.com/ApjHP7U.png", s1h3: "https://i.imgur.com/DlpOtHv.png", s1h4: "https://i.imgur.com/ftD2zvV.png", s1h5: "https://i.imgur.com/5k42J8F.png",
        s2h1: "https://i.imgur.com/PrXGLTg.png", s2h2: "https://i.imgur.com/zCtK0D7.png", s2h3: "https://i.imgur.com/59q3wg1.png", s2h4: "https://i.imgur.com/REjud5V.png", s2h5: "https://i.imgur.com/gQKKh52.png",
        s3h1: "https://i.imgur.com/UC4e4vQ.png", s3h2: "https://i.imgur.com/j7AjTsB.png"
      }
    },
    { 
      name: "Ricky", code: "RY",
      links: {
        s1h1: "https://i.imgur.com/hhyqaVg.png", s1h2: "https://i.imgur.com/YazVyDu.png", s1h3: "https://i.imgur.com/K1yjme5.png", s1h4: "https://i.imgur.com/xjAcx0J.png", s1h5: "https://i.imgur.com/lyEhJrl.png",
        s2h1: "https://i.imgur.com/7hWmuYn.png", s2h2: "https://i.imgur.com/r9ayhlU.png", s2h3: "https://i.imgur.com/YjT5Na0.png", s2h4: "https://i.imgur.com/TKgksnD.png", s2h5: "https://i.imgur.com/jZPJ4Ws.png",
        s3h1: "https://i.imgur.com/88Uz8dF.png", s3h2: "https://i.imgur.com/lSnyhMk.png"
      }
    },
    { 
      name: "Gyuvin", code: "GV",
      links: {
        s1h1: "https://i.imgur.com/Ezuhxrq.png", s1h2: "https://i.imgur.com/FIgbeP9.png", s1h3: "https://i.imgur.com/qfYArat.png", s1h4: "https://i.imgur.com/SekFa4n.png", s1h5: "https://i.imgur.com/dfFhwle.png",
        s2h1: "https://i.imgur.com/wsVO5es.png", s2h2: "https://i.imgur.com/sUgmI3U.png", s2h3: "https://i.imgur.com/Xb2hjWK.png", s2h4: "https://i.imgur.com/tK2WAD8.png", s2h5: "https://i.imgur.com/qXpPvzV.png",
        s3h1: "https://i.imgur.com/Byx9XG0.png", s3h2: "https://i.imgur.com/9LjQyJK.png"
      }
    },
    { 
      name: "Gunwook", code: "GW",
      links: {
        s1h1: "https://i.imgur.com/dcxbaL4.png", s1h2: "https://i.imgur.com/1smPfcS.png", s1h3: "https://i.imgur.com/MxeR9X4.png", s1h4: "https://i.imgur.com/MdRFBIp.png", s1h5: "https://i.imgur.com/chzA4Uk.png",
        s2h1: "https://i.imgur.com/qCrYKRe.png", s2h2: "https://i.imgur.com/rGDDFqJ.png", s2h3: "https://i.imgur.com/CtPynPV.png", s2h4: "https://i.imgur.com/BGCyRF7.png", s2h5: "https://i.imgur.com/HkAHz2N.png",
        s3h1: "https://i.imgur.com/duneiUy.png", s3h2: "https://i.imgur.com/WmQp5KJ.png"
      }
    },
    { 
      name: "Yujin", code: "YJ",
      links: {
        s1h1: "https://i.imgur.com/4XlEMns.png", s1h2: "https://i.imgur.com/0b7s2xf.png", s1h3: "https://i.imgur.com/b7bVsXs.png", s1h4: "https://i.imgur.com/MbdX3AV.png", s1h5: "https://i.imgur.com/JyQCxUi.png",
        s2h1: "https://i.imgur.com/QOuAaHZ.png", s2h2: "https://i.imgur.com/X5aFooc.png", s2h3: "https://i.imgur.com/heTdf5L.png", s2h4: "https://i.imgur.com/vN9qTLf.png", s2h5: "https://i.imgur.com/2yhgErl.png",
        s3h1: "https://i.imgur.com/DnfKQzf.png", s3h2: "https://i.imgur.com/W4HL4Mk.png"
      }
    }
  ]
},

  ]

};