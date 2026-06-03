import { useState, useEffect, useRef } from "react";
import { MoreVertical, TrendingUp, Settings, Sparkles, BookOpen, ChevronLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from "recharts";
import { supabase } from "./supabase";

const HABITS = [
  { id:1, name:"Be Proactive", tag:"Own your responses", gi:0, desc:"You are responsible for your life. Your behavior is a function of your decisions, not your conditions." },
  { id:2, name:"Begin with the End in Mind", tag:"Define your vision first", gi:0, desc:"Start every day and task with a clear picture of your desired destination." },
  { id:3, name:"Put First Things First", tag:"Prioritize what matters most", gi:0, desc:"Schedule your priorities — not prioritize your schedule. Focus on important, not just urgent." },
  { id:4, name:"Think Win-Win", tag:"Seek mutual benefit always", gi:1, desc:"Frame every interaction as cooperative, not competitive. Look for solutions that benefit all parties." },
  { id:5, name:"Seek First to Understand", tag:"Listen before you speak", gi:1, desc:"Most people listen with intent to reply. Listen instead with genuine intent to understand." },
  { id:6, name:"Synergize", tag:"Create more than the sum of parts", gi:1, desc:"The whole is greater than its parts. Creative cooperation opens possibilities no individual could achieve alone." },
  { id:7, name:"Sharpen the Saw", tag:"Renew yourself regularly", gi:2, desc:"Preserve and enhance your greatest asset — you. Invest in renewal across all dimensions of life." },
];

const DEFAULT_SUBS = {
  1:[{id:"1a",text:"focused on what I can control rather than what I cannot"},{id:"1b",text:"chose my response deliberately rather than reacting on impulse"},{id:"1c",text:"used proactive language — 'I will' or 'I choose' — in my thoughts or words"}],
  2:[{id:"2a",text:"made at least one decision guided by my core values, not immediate pressure"},{id:"2b",text:"reviewed or reflected on a meaningful goal or long-term vision"},{id:"2c",text:"began a task by clearly defining what success looks like before starting"}],
  3:[{id:"3a",text:"spent intentional time on something important but not urgent"},{id:"3b",text:"planned or reviewed my top priorities before getting into the day"},{id:"3c",text:"said no to something urgent but unimportant to protect what matters most"}],
  4:[{id:"4a",text:"sought an outcome that genuinely works for all parties in a conflict or negotiation"},{id:"4b",text:"entered a situation with an abundance mindset rather than a scarcity mindset"},{id:"4c",text:"chose cooperation over competition where it was the wiser move"}],
  5:[{id:"5a",text:"listened fully to someone without planning my reply while they were speaking"},{id:"5b",text:"asked questions to understand someone's perspective before offering mine"},{id:"5c",text:"held back my advice until I was certain I genuinely understood the other person"}],
  6:[{id:"6a",text:"built on someone else's idea rather than dismissing or overriding it"},{id:"6b",text:"contributed to an outcome better than what any party could have reached alone"}],
  7:[{id:"7a",text:"did something physically restorative — movement, exercise, or rest"},{id:"7b",text:"invested time in reading, learning, or sharpening a mental skill"},{id:"7c",text:"spent time in prayer, reflection, gratitude, or spiritual renewal"}],
};

const TOTAL_DEFAULT_SUBS = Object.values(DEFAULT_SUBS).flat().length;
const GC = ["#a78bfa","#fb923c","#34d399"];
const GROUP_LABELS = ["Private Victory","Public Victory","Renewal"];
const SELAR_URL = "https://selar.com/t558n83s00";

const ONBOARDING_SLIDES = [
  {icon:"✦",title:"Welcome to\n7 Habits Tracker",body:"A daily practice companion built on Stephen R. Covey's principles for enduring personal effectiveness."},
  {icon:"⚡",title:"Character over technique",body:"The 7 Habits aren't hacks or shortcuts. They're principles grounded in who you are — the foundation of lasting effectiveness."},
  {icon:"✅",title:"Check in every day",body:"Tap a habit card to expand it. Tick the specific actions you actually practised. Your score updates with every tick."},
  {icon:"📈",title:"Watch yourself grow",body:"Track your daily, weekly, and monthly scores, streaks, and long-term trends. Let's begin."},
  {icon:"👋",title:"One last thing —\nwhat's your name?",body:"We'd love to greet you properly each day.", isNameStep:true},
];

const GREETING_TEMPLATES = [
  (n,h) => h<12 ? `Good morning, ${n}.` : h<17 ? `Good afternoon, ${n}.` : `Good evening, ${n}.`,
  n => `${n} returns. Let's go.`,
  n => `Hey ${n}! Ready to build?`,
  n => `Welcome back, ${n}.`,
  n => `${n}. Today counts.`,
  n => `Back again, ${n}. Good.`,
  n => `The work continues, ${n}.`,
  n => `${n} shows up. Respect.`,
  n => `Ready to build, ${n}?`,
  n => `${n}. Make it count.`,
  n => `Good to see you, ${n}.`,
  n => `${n} is in the building.`,
  n => `Let's get to work, ${n}.`,
  n => `Another day, ${n}. Let's go.`,
  n => `The practice calls, ${n}.`,
  n => `Eyes forward, ${n}.`,
  n => `${n}. Sharpen the saw.`,
  n => `Begin with the end in mind, ${n}.`,
  n => `Put first things first, ${n}.`,
  n => `Synergy starts with you, ${n}.`,
];

const getGreeting = (name, hour) => {
  const n = name || "friend";
  const idx = Math.floor(Math.random() * GREETING_TEMPLATES.length);
  return GREETING_TEMPLATES[idx](n, hour);
};

const PRO_HASHES = [
  "be2a3ece63c69199f6dd5131e333b1ea372fe2467f79a26448cc2e1f18c8df04","da673abc8d9a5ad160c7e5476b30720a3e0f470e044767055d5a3c02fb5e2d4b",
  "ff61e03f7d4645c72454710ad0c8308fe4a64ef8a5a329d496f220887d251879","1b2404e8bf500a7da2caa1fea1db877b0439b527df1bd2e8094d1b659dfd0fb0",
  "88743dcb6f6f5276081a2add7237203988805ade49526bf25fd08827bfeddb38","576f635760b7b52722d3e7b7342a5312eca475d4c2b291dd70e50b2a4d2ae4aa",
  "ca39de61c1ce053d0b9f947c3fb120170ab653c440cb2aae19975dba200a52be","424a2d00b6d55c0d38b8e716b6f63911a163d5239a8c370775bd9e573159e720",
  "63ffe75783688de922d8d93d03f6f63bbe18082f8281d8f4695ee0d3e7408447","d243555ace1da8812c98d525203f3da5a75bc97f0ac3c6611d5d016cb83ee1d9",
  "3484d819845c6eb1c06c4e64fff452a33ae47435d2f44a173bbab7336ceda74b","a7546bc5becc464d0931a20ca3630a293f07812a53a827887a822398ce189299",
  "dae4b9f40bab1014fee7f73b1a124ebd00ea0a2deb1db1abd5756b54298f2523","15f4cf7260d36fcc7ccc7886e38a9b0f8e2d73a8bdf32cc3cef0127c4a4bbb66",
  "f36ee5b96760fe68df14967504b26762b9a0de7d4880863ef199708b941347e5","94386ec349d2ca97f0d4d8553c3e2e7f01abd19a41c0f80464b8360a9e3ea4a3",
  "63f914dff5f74934716b838efe53a645d47c207193a25dc22c68f300b1bc2a7b","fb726057ae1e1b054895a8404042acd86162368270b6767cd29670cd229aaeac",
  "b8eefccb9bc6e9d3c68f04f17a536009c3de0f0818784867b33efeefd171d5c9","3363ed9d152315edd24f8879d89d342049fcd01b7e1eb6d779232d95664ab0fd",
  "1a83bcefdffb64bd0a70d54edb703550b0712df4124dbc0f034d507289b66bc4","d829e7246ed2cb0bf86acd5662d0915ff42acf4c9f73f55bf1a16158b3161bc7",
  "655d9230690c98c254c65398fc7dffcaa9cf811cf90a53760d69e328044d31f2","a973e19fbcb7beab2b7cbe2e3185effdb68f70073120d7e02dd8b7fda220b051",
  "f71538391f0f0e7de8aa08d070447528a0ec6f5cb34089a6a51feecf15780f7a","511dac3e4182a30f13011d57eb2abb29f3b721cce0727f7ccfa2ce291f414b3e",
  "c1e10649868e35c4a62a6b6869ab101df220d83f09b7a5abcb04dbd2d3dc4221","7bf85513df4c8537d4735a020086ec8683be8d6ddd4e2f0a45eceb283ae08e3a",
  "422cfb5927c4eedeb0f437b6f1021b3ef95266cbf4c52c5ca4511d9fa8b01eb8","fdfdffe82e79d795d260681d21903917058d020c243b0264100f6195877d5e0b",
  "f471707b30b97312c2a22af72e66462d7044b8b138da1b95844849c0d9951ff5","15504dc0ad57a04cf63d1b051b2f463ec39bab2f28bd8dfe989c37a86f3729bf",
  "5d4b94b09a88ed5c09974f787f43fe1b866b9a8fe893af84556374343a973ffb","ed3610a4e848cd6e5ac7d53c663e324e29ad9541e08d39b65e3977df71db801f",
  "49318e97db1ca4cb16077858b22e9c1964f2b7079380e2995ace388708b147e0","38695a3522e67f4fea73dfcce2ecdd777f8cd2d43e24fed11ca7edd8fab14c8a",
  "0155d3dc06101f95b0513249fed7e16bc39da810804e8a267636af8b3bf46b10","c8270bf7ffbe8bcf3d3aa34f549f709ed4b04543cb5f8416d6e95f648787287b",
  "18812629cdc362f0b6615c28c6bf5641ae56d7bf3334fd4939d6703caf50b98b","618f08149bfc1a9440d0ffc3efa2f7d603a8b40b54ae6ba11b48c1ad0fa98085",
  "27d3f6e728aebe764b43f9c388ae5138fc3ee56089df66762b41b2436b33aa86","bdbf11b76b837e0c043706f473d763c026fcbf96ede0b3063f755771fea5939e",
  "1e9e6a47be7a30ef7a968752ce8fc74dbbe6336b48f5238387b6464f2cf4afff","f6ebfe7152f6400bae0d0f6b2b636f21786f5f7c092702e5559f4659f952a5f9",
  "116c6377c882a8295af5b7c8d707d26962b1c3e6d85e0fedc6ea4c25e3348a64","c28fe84f4de45b71124668f8e642a0796afbea39d3f7ccf0291fefbc5727dd84",
  "f09f082a062fb9b56bbbd3931cb8e263ef1707083ad5b8703c8ef61cfdfd9ea1","08dd763971037fc2c501c680ed033b0e72f17d38f498675c21f289f3e3ff9a86",
  "0cfaa4c91888ffe871eb611602da563938b81271d9383aa30acd8693c471d8fd","549c5c333e1f05cfbef3c573619d4391c4ac36ad3e9d11f46aea3d1bddd221fa",
  "ab22d6d9d647f2b6224b7bd26900efde3dc5893c26a85a2acc573d0237d797d4","67254fedcb280faee9fe14a8f1b5772a632fb0faac9efeec59af87b823f5b4b1",
  "854189c90a044522cde614f7970e3ec7cb557e64cc32051fdda159420475fd0a","cf53f6c202db64580b667785411ee6503222191e41980b30215bf00267020b1b",
  "0ce7540a045538ffffe04a146a5856a4076eae47fa5e483598f00032a3c12cbf","b8189058308d3bb2846418e4d643d7d48bbe916b545d59f0b781661be1c1b668",
  "a0554ca7b314c7fb8fb231f2953d934537e188176d6a0041a2eb7923c16b252a","9458adce7f9d0e8d95cbc699c4309f99f0de6c6dd2c8a331002c614ac0a6248f",
  "5deb4e77eba0347cc39f5bf1979b99c24643075dab30c079a783fb0ef8dcbedd","1790e0b5faedebf50abbf00e0fca43e5e4c2d374c3211ffc68c6c0d4ed2853cc",
  "879fb1a0e2a7a2db2c8e3d5a6107b8b82db457917e9eaae1cedd7ecaa2c24408","f3d6023942a6c053dc661c1b259855924c8af6fd138289b6ae3b0b19650cfb50",
  "44b1e43d92072aec27ab10fca45566c2c139276657586a9f6ec7a72b7c355b7c","4c7ab25a51a6f3bbadcc44d5968d01ccd33b378ddf07c7985678d9a6a226f2bb",
  "40416eaf39d59e05539628a9c0cc08b4bdc9a7dfc20acc9cb117c759ff47bd0e","69bc53824c380200b13189b26a0780074fb0bb5d037d5901464e4b9372701860",
  "662eb988e3abf89a0dc2d264666bc1501a98813a05db70fd1392e00c0589ad23","f8c348eed76269b044a6c036ebd205a0aa137baeb1c7ccde550595c216482324",
  "25cade5ceff8a1181e9c624af0621a9c5d3a4316989576712ad221a13703727c","a1743e31ff2f8f03a2d72779adefce7ef7ffa732957edc21b79927f0d8a952b6",
  "7f5327debe00acf6a35c6c0df61062fae0d86664e0742bb819b711d6d8a52919","42618af3421910f0606949482ab84d5ee014d22a4608e122660ed263f69a8ce4",
  "e62118e8335bb8578da160131015e3e62f4f7c888ff00bebdeb4d940f77a336d","84d0c98c4c6f5da2847f2c9c3bb1742ac80d9c525416d62de21539fe6672213d",
  "c1e1cb8371f2f0c3d726a749e6172fab8e91888ea5f744da7607b8bb79b207c6","7c00c787da298c799fe0734db9d64c546cd41c8d79d1fe4440db10669f90d15f",
  "148a03969194648311eb7f0a31daa376038f86a3a60ccd3b4b468d11f2841b6d","08de2bb02226b1dd4a8b7c7879a0bb0a7078df7dcbcb961d45edf913b742de2d",
  "5eb4b1892b46161cd9e307b816396d02f34063601fa1609adc71a1e67a674e6b","dcac2d6f3438e82e89531d85922ef818c51b65dc3cf278ea053f82e6eae66d4a",
  "6edff93a32af9affec832577ad39c670421fde1277034ccb068b4fe1c1c047a2","d37ebdb0ad5b3ac4b7e6e5222ff96000d36b43e838d3ebfb311ee1f1eb938fea",
  "a5aacb1729a6f0338354d558949b4eb700a59491de683bb89b1ec2ad8e30e17c","75eeee2445479380f5875905eec3504418c8fbeaccb4c5dff31b2c21e1adb529",
  "5edcf70a8b44c3705eb67289839c6022ed692ee0d6658e62bab541ed490d17f8","466253149a97074560a5cc09c54de87c9bd2426ec1da8d6c4355dbb16036844b",
  "925a09d45bc7afa92f28e1aeded440e053a9eb8cc97e0dd5b735a64130da5327","9879d8fedb59d6d92ea9dc00a82416d52411f778fb1aa1d9443746a5875707c8",
  "6c638e5495d6532f98e98c843cc5eadddb1798923441e5b1dd0daf69395c3845","078ba96b590101099f13705742768970eed007cc1a18c282267b8ea4787b5492",
  "ce37bc6dd237c12d6d04b3f4ec9869c08b38645ed1fd4ec5b9c8192b149bb2fc","3aff8b6d733f331c400f01d308216b73d1cb681bf027b7ff6e3f5f1e1ce2d0e0",
  "b5ac819bdbc7e7a76dad9627bacfbe27b5ac0a13871dc7d74a1b9b8698b5fc0b","5336caddcdeab44a574da640f8d782eda1c45e9f369f4467611a5e5e2d495ad2",
  "7ae91158d562ec57b0acc5309715c576005df92b485aae8e2f21c35c6488a1c6","2c532f9169edfcb135966387a119e01aa048c76a6f9218d2280c0ce70195f554",
  "dc22dc9e4a60e6fbb09936779dd2adbd255e39dc47c1b1fabfe3fd87eaa48955","b920292b1f45ef7ee68525fe62e3f821408488fc7c09fa03ae4e82e6002806fa",
  "682eef8cb14b3072f0d5ed043f2baf8213e9bcdb4623ea8714429e2e0ab4e78c","2abcfe2f1cf504429d8cb0a5f22c82561a02797f8e8df8fdfc2b435b9ae9efe2",
  "b532a29115d669048895933dd906e722943058df3db8ea7f3d28496b3b8b2839","6f3af7da80b85189b64c6d1978384f0364a1c151c760c2828a9a88051882586f",
  "201c9d74634aa9b103e235193ad4272772cae17c100e87d22e87092305080dfb","97b5ce285d096c37269241fbf1988b5082838289b619da9b42e748ea76a34530",
  "d481b10a1197e0cc1a00d34ab945a96544edd4735ba782c5426abf15bd542834","e8b75a090b39b9f06c876227d1744701ab9f33f63f499b3bd2b587e98c63af88",
  "2123efe34ad26ef8f68f678801c2d193e4cd07ffe7550f3d37d4e7044bc3b4eb","66e36393d45f4f02d98def21c5715c0acf59965bfab7975523f29c539f7930f0",
  "562bb9636b78c25a75055ad4b37ad96ecd7b6fe4e8ddabd6625d5f1225f7841d","17d1f25b49bd8c7da9dc8f582cfb5568a560d9681234d58ab214915f16c04040",
  "a844e19c409032bcf469925548abe48534ad3ffde1cc537673c34a166677f6cc","74ea379579c86ddf96013a2c46a47ec7ec77cd8c7261361980052f958ca726e8",
  "8c04d32fbd20fb006c282233ff5e9022b829d3ad922eace074eed6655baf62cf","6a2e98626dacb71a9c89d429735dc2831d4ee82003c853bdf7e99eacfc94b95a",
  "0cb3dd9d80119a35437ccdb7d58924e064e3e66c30065d4799d27b3f739d2d45","2263ee17e6840f65729bf28a427164970fce98ab3e30f24fe2f55c43786e17f4",
  "243d48298896782aa0631a0726cc912d70a289fdff71facdeb5bfbcaa2d0c0b9","a1ddf0a36363008d6646c89d29dd52744ba39aab54ed7c68522d35881f114d57",
  "8769ea14b6dc149a93df4ba18c360ef9c3a7eaf28808ba8ff73882b187820b6c","5ebad1540db01358cc19e8d18e46ebde922f5711d2b292a25640e24169041587",
  "7a059beeaa9b4b7dffdf93c2a6863511fdee33566f36b2dc2d60c0f6488afc73","b6d7eddd7671046d1c9daf38ffd48576e684d5db37b442555ffece541a206507",
  "0bb94352d97cf550937f89212d6aaaa7963456a04b77c0d3c94604ea036fb09f","bcaf0957b7070219e8908c9d507fbe83ebe48aa43aba14feb395b67f5367b370",
  "7cf90e48c1cc24c8a401faa87a7d064a49846071037f16d81a1c9d14078470a2","28785f7fdff2f0940dbf27db3db7ae2ef74892e158c0abc2eb35ebf132d936d3",
  "0ed56e52267c9894b1d90c268ebbfe5bd50ff90e67bd6e4e1780a871a51a073e","060f67a9317ffc5340437fcf3389ccfaf5da252e927ede156ee8bf0b26976d91",
  "b4bcada4fcad4cfd05cbf5a3b66c224944a7e79e5b779ccd49e233fd70dd65c6","57218a65b0451d7db7d76c8fd03f28ea86963ac7a36cf0aaa6adfbe9b4f79b80",
  "64a795c85a9f21e2a6fdf1360727b6930d79961591cb99a814de1d09144b0c4d","6f53f2031bfd5b336199300fbe4ca39cacbf3f4232ff6e58190e714acb2c39cb",
  "6640e39d5254a028f5f7d643b4030329db9d1bf28239c42865a7751f146b7554","b623d8edb226b622d57a89801172a7520a59a33ee6fb73e611dcec70fa98ac3a",
  "beeab95a16f9ede5d5fd45c836e7f4e47a3208d33e124ff2e2adee297f6a154a","6ff6e287dfdb2f88b804f811b5eaf611f1092e7b210ecc44b0f1bdba8e13a584",
  "60820947260f58a268f6ea33ad63a586109d417c712dd0b6987489f04478dc60","83528d5049b55f6ba62c1935427cd52a1dc58a756f327b84ebe40ae8f2c29151",
  "d3ce8f8fcc0da8a9b983464fa5cdc1c57e5c561299f9f1dbf4e9e602743afe02","eeccbd594cea5c48f32f43e29a6b547596146847a5997677a8275e4496d11bfb",
  "b742ad2abe14b37ca3792ce841215ed8214497ded45dd7cb9518c795f5af85d7","139a4d41b15a41f7c9e95e81e05950ed7b8a4cabc698a7120a061aeab4ff8a51",
  "e09cbeacefe4e8fd9e97f6c37856d677c49ff4d2d01b358d7ffbbdfb72dbe2dc","f34c2512f2ced72c2037cecb69b41c60071ab0bb248eaf152ee35128f24fb4f4",
  "6b8e9c4c115237c5456019c62894be2dffa7169bd195afbb12096fa22197cea0","2d5b24e1789afc9f7bc70015fb34de47b511108243fdb02e7cce23f285f05a0f",
  "523474c9bf32699933a72905b9e9d4b40caeade061aa749510a50613cbbdd50b","9f9e9a78ffac4486575e5c742a1a070230ca05c1f7749ba5763e4a1b9beba992",
  "be0f155cad2a1f2691c2609ab51d5e7f7a27e46af36ceb2a65fab6e283126e34","a6af7eef494510b49cf61bdcb7cefddb45a2d0eb2d8c1adc329ac958894a2451",
  "ed8df437c63fbd7b4c7271722b9383478241ac57d55458c4221f7e9d1e08e56b","f61f78c1bab6aff18097223736968c9ac3bece8a740914b93f412a8e3f7afa92",
  "b33dd959df6840ca1b6670558b9cc0d7c00cef69302d1f32f066341a068238ca","2b807541e1ffe61c3e99c8978d91e83b5163da04766d15d24870d08225149053",
  "c99a9efd6e1fbb1c38e32c72a0ccff5b7e889ad566b9af57bc32defe1b8ddb69","45302ea94b87e79fb74ef900bb3518d184ab9e1d2de044df532215e4e2d610bb",
  "6f9322cf8e90a11b13c94c8f92c334ec3bb3777fe6af6ed5b475437d6b74190d","eab626f6a142bd78948d81b54beaa00b0b451631ab0205dd517ad45a725a8b06",
  "6df6498ad907bb29f33dfabfb8e558adb7ff311984d9ab77ed9a5d2f3dcfc3c8","2202e1b67bf695a37a10ab3c046d33311da2132c945c25b008ec5c2a9e0eeea7",
  "d292e62a54c36781d7b6843ec58b1b49bb939532451042a586b90b68818e58f5","8ad15b7a869a107e93f847fc01dc964ce901f5c4e9b651601a1cd4f6c64b3011",
  "f6f9a1bbfbd62c97cd3c350d4e60f769727246e6bf8d29f246f559de9531bb9c","f1432912ddd8a74a3c00dc2a118e7b6cf3f481a8f0d9ef9a880a6df465ec8629",
  "9a606526370d65cf8d6c97ff2c745e9cc763733234ea7e837ab07acb5732b083","d2bae37003727b17a7c5edfe00d90a909da879ee41f5225113e105f1039e3c14",
  "c19376c04c30aa5a9db404cc9cb9fcf5a111c232576cd4bb7e82c92d4dca243b","c2df265636c18f1ab1d6b9aa364f5901124a4e02ee9d0050df1aaa401e6f1010",
  "49a9ffa680c98903564349cf2027a008527aba2110ea683221d0f66b67a8ed92","d5dd5e46e84eb7eb6aaa24d7814e0b0b36e706fb0d2e9983148af6d1d1a527fe",
  "00a49eb9dc9e5eb3538ad64d0318b02d33cc23581e34a5fe06d9155dc536b5be","19e0e22e15e368d9ab7ad6e7a73fd0a693377834e5e7a09bc88e59ed1a9ef521",
  "65a5d727d3eeef79214eb87122c315e658f549ce3f69bdba2368ec1a09840dea","fc7b8cb419e2084b28c1a3d6abb6c1ca5e28ec0cc6fb54feb2fe4ef038fff26e",
  "3d944c7f1e3d09f6a4675729033b2c5289420d35bfbc243be7bf5f82884de097","5fb6e058baeb2bd080c055508360481aaee9576aad20dfc07995f82478d46c57",
  "0a9663ab31cbf7fc49c917a4e6f3aba544294480f8575832ec85cc2f819c2cfe","4f0c476f4de4ec4c4e2c02b77b45be0369bd4aca4db1c46d3333733a94f57b3c",
  "4c7bcb918d4742046b49a8a87a841a564a1e1882277d2f848faf4e44fa960f36","f788d183d25d6afda519e0393441ee0d5e72b53def617158546cdb8aa4b8a31d",
  "6504e93b49ffa09cc481080238cc34774033d5e77ae2daf7cca66d3b585e4ad9","52f40048935934104f30aede79f22191858486b37c492550c42d68270ffc64a7",
  "581638e2e697acd25c5841b5c90a4c868aba1109d5f12d9fdeb38430ef968e5a","59dbc12e5f6afd2cedd0a8e4d66af86923db983b398eab6fd593d8a921a7c6b3",
  "0e56e9062433a935a63689ee6018a44820da6ba23a04d49df43f9f0551b379a9","d7a7d6ec446b41c9f0412e366c9a0c74c77801427fa296c4e81d17c17ec065a7",
  "ab09add1464f053f923141c458782e78faf62b54dd168257fd425f483ced47fc","f39df6704014a6fa177c8a5acf8cf92b51bead37c5206f14c6aef8bd01c71818",
  "3b04fedd77965c8395460bc511b6094e97fbe33f77e1c9a0bd5d81b5b0e1978a","c606cc271c44c1a983e9459e4baae22858387fc03091b1e25ef0f9ab9bd31d2e",
  "510b6472f77de8ca7eee2442824070a60e6de7ce9e4895ff9d083acaba6e3807","3f44b2ce1f2bebab2147f52edfc9aabdf233d543db1c6a616d410a2526489b23",
  "b8fcd895fec822d3cd60e1dd55c0f13a3dd9b208227abe84a958f49a09aacddb","cd80ad08640392ba46cb504618ccfab677b732c99de30baae1fe196040d9d1c8",
  "f2b70e35ec1cbcf3365be00ab66bce997c508203ea9e0b2e706ad39643f59464","02fe5e9c4cdd54170dee5d5f6a506d5bebff4cde3eb85dd8d7bbecf0f5e91e90",
  "e7100452d1a68c228f460ae501b083a40c3f58e59a52dd1640350a0bfd504374","b9274bb988e7f99db9fe59d237736765320acba44765e5079acb6f489f0e5208",
  "b216141d3644c68b56f6b7d27f05c7126b3fde47b2510e1e175c050d2aa09e86","7b45deb89c88d865de4c238d8692706b84a8fdd6e260debb0e051239a7c809dd",
];

const hashKey=async(key)=>{const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");};
const verifyKey=async(key)=>PRO_HASHES.includes(await hashKey(key.trim().toUpperCase()));
const claimLicenceKey=async(key,userId)=>{
  const h=await hashKey(key.trim().toUpperCase());
  if(!PRO_HASHES.includes(h))return{success:false,error:"Invalid key. Check and try again."};
  const{data:ex}=await supabase.from("licence_keys").select("claimed_by").eq("key_hash",h).eq("claimed_by",userId).single().catch(()=>({data:null}));
  if(ex)return{success:true};
  const{error:ie}=await supabase.from("licence_keys").insert({key_hash:h,claimed_by:userId});
  if(ie){if(ie.code==="23505")return{success:false,error:"This key has already been used by another account."};return{success:false,error:"Activation failed. Please try again."};}
  return{success:true};
};

const makeTheme=(dark)=>({dark,bg:dark?"#09090b":"#f7f7f2",card:dark?"#18181b":"#ffffff",cardInner:dark?"#09090b":"#f2f2ed",border:dark?"#27272a":"#e4e4df",divider:dark?"#1f1f23":"#ebebeb",text:dark?"#fafafa":"#0f0f0f",textSub:dark?"#e4e4e7":"#1a1a1a",muted:dark?"#a1a1aa":"#6b6b6b",dim:dark?"#52525b":"#9b9b9b",veryDim:dark?"#3f3f46":"#c8c8c3",navBg:dark?"rgba(9,9,11,0.97)":"rgba(247,247,242,0.97)",trackRing:dark?"#27272a":"#e4e4df",sheetBg:dark?"#18181b":"#ffffff"});
const localKey=(d=new Date())=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return`${y}-${m}-${day}`;};
const getTotalSubs=(ca={})=>TOTAL_DEFAULT_SUBS+Object.values(ca).reduce((s,a)=>s+a.length,0);
const calcScore=(h,t=TOTAL_DEFAULT_SUBS)=>Math.round((Object.values(h).filter(Boolean).length/t)*100);
const lastNDays=(n)=>Array.from({length:n},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(n-1-i));return localKey(d);});
const dayLabel=(key)=>{if(key===localKey())return"Today";const y=new Date();y.setDate(y.getDate()-1);if(key===localKey(y))return"Yest";const[yr,mo,d]=key.split("-").map(Number);return new Date(yr,mo-1,d).toLocaleDateString("en-US",{weekday:"short"});};
const monthDayKeys=()=>{const now=new Date(),yr=now.getFullYear(),mo=now.getMonth(),keys=[],today=localKey();for(let d=new Date(yr,mo,1);d.getMonth()===mo;d.setDate(d.getDate()+1)){const k=localKey(new Date(d));keys.push(k);if(k===today)break;}return keys;};
const calcStreak=(logs)=>{let c=0;const d=new Date();for(let i=0;i<365;i++){const k=localKey(d);if(logs[k]?.score>0)c++;else if(i===0){}else break;d.setDate(d.getDate()-1);}return c;};
const calcBest=(logs)=>{const s=Object.keys(logs).sort();let best=0,cur=0,prev=null;for(const k of s){if(logs[k]?.score>0){if(prev){const[py,pm,pd]=prev.split("-").map(Number),[cy,cm,cd]=k.split("-").map(Number);const diff=Math.round((new Date(cy,cm-1,cd)-new Date(py,pm-1,pd))/86400000);cur=diff===1?cur+1:1;}else cur=1;best=Math.max(best,cur);prev=k;}else{cur=0;prev=null;}}return best;};
const fmtDate=(key)=>{const[y,m,d]=key.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});};

const stor={get:(k)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},all:()=>{const r={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith("log:")){try{r[k.replace("log:","")]=JSON.parse(localStorage.getItem(k));}catch{}}}return r;}};
const syncLog=async(uid,dk,log)=>{try{await supabase.from("logs").upsert({user_id:uid,date:dk,habits:log.habits,notes:log.notes,score:log.score},{onConflict:"user_id,date"});}catch{}};
const fetchAllLogs=async(uid)=>{try{const{data,error}=await supabase.from("logs").select("*").eq("user_id",uid).order("date",{ascending:true});if(error)throw error;const r={};data.forEach(row=>{r[row.date]={habits:row.habits||{},notes:row.notes||{},score:row.score||0};});return r;}catch{return stor.all();}};
const fetchProfile=async(uid)=>{try{const{data}=await supabase.from("profiles").select("is_pro,custom_subs,custom_habits,grace_tokens,grace_tokens_month,name").eq("id",uid).single();return data;}catch{return null;}};
const ensureProfile=async(user)=>{try{const{data}=await supabase.from("profiles").select("id").eq("id",user.id).single();if(!data)await supabase.from("profiles").insert({id:user.id,email:user.email,is_pro:false,name:""});}catch{}};
const updateProfile=async(uid,updates)=>{try{await supabase.from("profiles").update(updates).eq("id",uid);}catch{}};

const generateCSV=(logs)=>{const headers=["Date","Score","Actions Done","Total Possible",...HABITS.map(h=>`"${h.name}"`),"Notes"].join(",");const rows=Object.entries(logs).sort(([a],[b])=>a.localeCompare(b)).map(([date,log])=>{const done=Object.values(log.habits||{}).filter(Boolean).length;const habitCols=HABITS.map(h=>{const subs=DEFAULT_SUBS[h.id],d=subs.filter(s=>log.habits?.[s.id]).length;if(d===subs.length)return"Complete";if(d>0)return`${d}/${subs.length}`;return"Skipped";});const notes=Object.values(log.notes||{}).filter(Boolean).join(" | ").replace(/"/g,"'");return[date,`${log.score||0}%`,done,TOTAL_DEFAULT_SUBS,...habitCols,`"${notes}"`].join(",");});return[headers,...rows].join("\n");};
const shareOrDownload=async(blob,filename,title)=>{try{const file=new File([blob],filename,{type:blob.type});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title});return;}}catch{}const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);};
const exportCSV=async(logs)=>{await shareOrDownload(new Blob([generateCSV(logs)],{type:"text/csv"}),"7-habits-history.csv","7 Habits History");};
const exportPDF=(logs,email="")=>{const entries=Object.entries(logs).sort(([a],[b])=>a.localeCompare(b));const total=entries.length,avg=total?Math.round(entries.reduce((s,[,v])=>s+(v.score||0),0)/total):0,streak=calcStreak(logs);const rows=entries.map(([date,log])=>{const done=Object.values(log.habits||{}).filter(Boolean).length,s=log.score||0;const cls=s>=70?"color:#059669":s>=40?"color:#d97706":"color:#dc2626";const groups=[0,1,2].map(gi=>{const hs=HABITS.filter(h=>h.gi===gi),t=hs.reduce((sum,h)=>sum+DEFAULT_SUBS[h.id].length,0),d=hs.reduce((sum,h)=>sum+DEFAULT_SUBS[h.id].filter(sub=>log.habits?.[sub.id]).length,0);return`${d}/${t}`;});return`<tr><td>${date}</td><td style="font-weight:600;${cls}">${s}%</td><td>${done}/${TOTAL_DEFAULT_SUBS}</td><td>${groups[0]}</td><td>${groups[1]}</td><td>${groups[2]}</td></tr>`;}).join("");const html=`<!DOCTYPE html><html><head><title>7 Habits Report</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Georgia,serif;max-width:680px;margin:40px auto;padding:0 20px;color:#1a1a1a;font-size:13px;}h1{font-size:26px;margin-bottom:4px;}.meta{color:#777;margin-bottom:28px;font-size:12px;}.stats{display:flex;gap:24px;background:#f5f5f0;padding:16px 20px;border-radius:10px;margin-bottom:28px;}.stat{text-align:center;}.stat-val{font-size:22px;font-weight:700;}.stat-lbl{font-size:11px;color:#888;text-transform:uppercase;}table{width:100%;border-collapse:collapse;font-size:12px;}th{background:#09090b;color:#fff;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;}td{padding:7px 10px;border-bottom:1px solid #eee;}tr:nth-child(even) td{background:#fafaf7;}</style></head><body><h1>7 Habits Practice Report</h1><p class="meta">Generated ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}${email?` · ${email}`:""}</p><div class="stats"><div class="stat"><div class="stat-val">${total}</div><div class="stat-lbl">Days Logged</div></div><div class="stat"><div class="stat-val">${avg}%</div><div class="stat-lbl">Avg Score</div></div><div class="stat"><div class="stat-val">${streak}</div><div class="stat-lbl">Streak</div></div></div><table><tr><th>Date</th><th>Score</th><th>Actions</th><th>Private V.</th><th>Public V.</th><th>Renewal</th></tr>${rows}</table></body></html>`;const win=window.open("","_blank");if(win){win.document.write(html);win.document.close();setTimeout(()=>win.print(),600);}};

const scheduleNotif=(timeStr,timerRef)=>{if(timerRef.current)clearTimeout(timerRef.current);const[h,m]=timeStr.split(":").map(Number),now=new Date(),next=new Date(now);next.setHours(h,m,0,0);if(next<=now)next.setDate(next.getDate()+1);timerRef.current=setTimeout(()=>{if(typeof Notification!=="undefined"&&Notification.permission==="granted"){if("serviceWorker"in navigator){navigator.serviceWorker.ready.then(reg=>reg.showNotification("7 Habits Tracker",{body:"Time for your daily check-in.",icon:"/icon-192.png",tag:"daily-reminder",renotify:true})).catch(()=>{}); }}scheduleNotif(timeStr,timerRef);},next-now);};

function ScoreRing({pct,size=80,T}){const r=size/2-8,c=2*Math.PI*r,fill=(pct/100)*c;const color=pct>=70?"#34d399":pct>=40?"#fbbf24":pct>0?"#f87171":T.veryDim;return(<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.trackRing} strokeWidth={6}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${fill} ${c-fill}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dasharray 0.5s ease"}}/><text x={size/2} y={size/2} textAnchor="middle" dy="0.35em" fill={T.text} fontSize={size*0.19} fontWeight="700" fontFamily="'Jost',sans-serif">{pct}%</text></svg>);}

function LandingPage({onSignUp,onLogin}){
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#09090b 0%,#0d0d12 100%)",display:"flex",flexDirection:"column",padding:"0 28px"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",paddingTop:60}}>
        <div style={{width:64,height:64,borderRadius:18,background:"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28,fontSize:28,color:"#09090b",fontWeight:700}}>✦</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:700,color:"#fafafa",margin:"0 0 16px",lineHeight:1.1}}>Build the life<br/>Covey described.</h1>
        <p style={{fontFamily:"'Jost',sans-serif",fontSize:17,color:"#a1a1aa",lineHeight:1.7,margin:"0 0 40px"}}>Turn one of the world's most powerful frameworks into a daily practice you can actually track.</p>
        {[["✓","Daily checklist for all 7 habits with specific actions"],["✓","Score your practice and track your streak every day"],["✓","See your growth over weeks and months"]].map(([icon,text])=>(
          <div key={text} style={{display:"flex",gap:14,marginBottom:14,alignItems:"flex-start"}}>
            <span style={{color:"#34d399",fontWeight:700,fontSize:16,marginTop:1,flexShrink:0}}>{icon}</span>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:15,color:"#71717a",lineHeight:1.5}}>{text}</span>
          </div>
        ))}
      </div>
      <div style={{paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 48px)"}}>
        <button onClick={onSignUp} style={{width:"100%",padding:"17px",borderRadius:14,background:"#f59e0b",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:17,fontWeight:700,color:"#09090b",marginBottom:12}}>Create Free Account</button>
        <button onClick={onLogin} style={{width:"100%",padding:"17px",borderRadius:14,background:"transparent",border:"1px solid #27272a",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:17,fontWeight:500,color:"#71717a"}}>Sign In</button>
        <p style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:"#3f3f46",textAlign:"center",marginTop:16}}>Free to use. Pro features available for power users.</p>
      </div>
    </div>
  );
}

function TopBar({greeting,date,onMenuOpen,T,saved}){
  return(
    <div style={{padding:"16px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",background:T.bg,transition:"background 0.3s"}}>
      <div style={{flex:1,minWidth:0,paddingRight:12}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:T.text,lineHeight:1.2,marginBottom:3}}>{greeting}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim}}>{date}</span>
          {saved&&<span style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:"#34d399"}}>✓ saved</span>}
        </div>
      </div>
      <button onClick={onMenuOpen} style={{width:38,height:38,borderRadius:"50%",background:T.cardInner,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
        <MoreVertical size={18} color={T.dim}/>
      </button>
    </div>
  );
}

function FloatingHistoryBtn({onPress}){
  return(
    <button onClick={onPress} style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom,0px) + 24px)",left:"50%",transform:"translateX(-50%)",zIndex:40,width:58,height:58,borderRadius:"50%",background:"#f59e0b",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 24px rgba(245,158,11,0.45)",WebkitTapHighlightColor:"transparent"}}>
      <TrendingUp size={26} color="#09090b" strokeWidth={2.5}/>
    </button>
  );
}

function SideMenu({onNavigate,onClose,T,isPro}){
  const[visible,setVisible]=useState(false);
  useEffect(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>setVisible(true)));return()=>{};}, []);
  const handleClose=()=>{setVisible(false);setTimeout(onClose,300);};
  const handleNav=(page)=>{setVisible(false);setTimeout(()=>{onNavigate(page);onClose();},300);};
  const items=[{id:"history",Icon:TrendingUp,label:"Progress & History"},{id:"settings",Icon:Settings,label:"Settings"},{id:"pro",Icon:Sparkles,label:isPro?"Pro Active ✦":"Get Pro",highlight:!isPro},{id:"about",Icon:BookOpen,label:"About the Book"}];
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div onClick={handleClose} style={{position:"absolute",inset:0,background:`rgba(0,0,0,${visible?0.65:0})`,transition:"background 0.3s"}}/>
      <div style={{position:"relative",width:"100%",zIndex:1,background:T.sheetBg,borderRadius:"22px 22px 0 0",maxWidth:480,margin:"0 auto",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 16px)",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.32s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 -8px 40px rgba(0,0,0,0.35)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0"}}><div style={{width:36,height:4,borderRadius:2,background:T.veryDim}}/></div>
        {items.map(({id,Icon,label,highlight})=>(
          <button key={id} onClick={()=>handleNav(id)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"15px 24px",display:"flex",alignItems:"center",gap:16,textAlign:"left",borderBottom:`1px solid ${T.divider}`}}>
            <div style={{width:40,height:40,borderRadius:12,background:highlight?"#f59e0b22":T.cardInner,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={20} color={highlight?"#f59e0b":T.muted}/></div>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:500,color:highlight?"#f59e0b":T.text}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PageHeader({title,onBack,T}){
  return(
    <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${T.border}`,background:T.bg,transition:"background 0.3s"}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 4px 4px 0",display:"flex",alignItems:"center"}}><ChevronLeft size={24} color={T.text}/></button>
      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:T.text}}>{title}</span>
    </div>
  );
}

function Onboarding({onDone}){
  const[slide,setSlide]=useState(0);
  const[nameInput,setNameInput]=useState("");
  const s=ONBOARDING_SLIDES[slide];
  const isLast=slide===ONBOARDING_SLIDES.length-1;
  return(
    <div style={{position:"fixed",inset:0,background:"#09090b",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"60px 28px 48px"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",maxWidth:340,width:"100%"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"#18181b",border:"1px solid #27272a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:32,color:"#f59e0b"}}>{s.icon}</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:700,color:"#fafafa",textAlign:"center",margin:"0 0 16px",lineHeight:1.2,whiteSpace:"pre-line"}}>{s.title}</h1>
        <p style={{fontFamily:"'Jost',sans-serif",fontSize:15,color:"#a1a1aa",textAlign:"center",lineHeight:1.7,margin:0}}>{s.body}</p>
        {s.isNameStep&&<input value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="Your first name" autoFocus style={{marginTop:24,width:"100%",padding:"14px 16px",background:"#18181b",border:"1px solid #3f3f46",borderRadius:12,fontFamily:"'Jost',sans-serif",fontSize:16,color:"#fafafa",outline:"none",textAlign:"center",boxSizing:"border-box"}}/>}
      </div>
      <div style={{width:"100%",maxWidth:340}}>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:28}}>{ONBOARDING_SLIDES.map((_,i)=><div key={i} style={{height:6,borderRadius:3,width:i===slide?22:6,background:i===slide?"#f59e0b":"#27272a",transition:"all 0.3s ease"}}/>)}</div>
        <button onClick={s.isNameStep?()=>onDone(nameInput.trim()||"Friend"):isLast?()=>onDone(""):()=>setSlide(slide+1)} style={{width:"100%",padding:"15px",borderRadius:12,background:"#f59e0b",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:15,fontWeight:600,color:"#09090b",marginBottom:12}}>
          {s.isNameStep?"Let's go →":isLast?"Get Started":"Next"}
        </button>
        {!isLast&&!s.isNameStep&&<button onClick={()=>onDone("")} style={{width:"100%",background:"none",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:13,color:"#3f3f46",padding:"8px"}}>Skip</button>}
      </div>
    </div>
  );
}

function Paywall({onClose,onActivate,T,userId}){
  const[mode,setMode]=useState("pitch"),[keyInput,setKeyInput]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState(false);
  const handleActivate=async()=>{if(!keyInput.trim()){setError("Please enter your licence key.");return;}setLoading(true);setError("");const result=await claimLicenceKey(keyInput,userId);if(result.success){setSuccess(true);setTimeout(()=>onActivate(keyInput.trim().toUpperCase()),1200);}else setError(result.error);setLoading(false);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)"}}/>
      <div style={{position:"relative",width:"100%",background:T.dark?"#18181b":"#fff",borderRadius:"20px 20px 0 0",padding:"28px 20px 48px",maxWidth:480,margin:"0 auto",zIndex:1,maxHeight:"90vh",overflowY:"auto"}}>
        {success?(<div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:48,marginBottom:12}}>✦</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#34d399",margin:"0 0 8px"}}>Pro Activated</h2><p style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.muted,margin:0}}>Welcome. Your features are now unlocked.</p></div>)
        :mode==="pitch"?(<>
          <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36,marginBottom:10}}>✦</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:T.text,margin:"0 0 8px"}}>Upgrade to Pro</h2><p style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.muted,margin:0,lineHeight:1.6}}>Unlock the full depth of the practice.</p></div>
          {[["📊","Detailed Analytics","Strongest habit, weakest habit, best day, most skipped action — 30 days."],["✏️","Custom Actions","Add your own actions to any habit. Rewrite existing ones."],["📤","Export History","CSV or PDF. Share to email, WhatsApp, or any app."],["🛡️","Streak Protection","2 grace tokens per month when life happens."]].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}}><div style={{fontSize:20,flexShrink:0,marginTop:2}}>{icon}</div><div><div style={{fontFamily:"'Jost',sans-serif",fontWeight:600,fontSize:14,color:T.text,marginBottom:2}}>{title}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.muted,lineHeight:1.5}}>{desc}</div></div></div>
          ))}
          <a href={SELAR_URL} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"14px",borderRadius:12,background:"#f59e0b",textAlign:"center",fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:600,color:"#09090b",textDecoration:"none",marginTop:8,boxSizing:"border-box"}}>Get Pro on Selar →</a>
          <button onClick={()=>setMode("key")} style={{width:"100%",background:"none",border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",marginTop:10,fontFamily:"'Jost',sans-serif",fontSize:15,color:T.textSub,cursor:"pointer"}}>I already have a licence key</button>
        </>):(<>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:T.text,margin:"0 0 6px"}}>Enter Licence Key</h2>
          <p style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.muted,margin:"0 0 20px",lineHeight:1.5}}>Delivered after purchase on Selar. Looks like: XXXX-XXXX-XXXX-XXXX</p>
          <input value={keyInput} onChange={e=>setKeyInput(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX-XXXX" style={{display:"block",width:"100%",padding:"13px 14px",background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:10,fontFamily:"'Jost',sans-serif",fontSize:15,color:T.text,outline:"none",boxSizing:"border-box",marginBottom:12,letterSpacing:"0.05em"}}/>
          {error&&<p style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:"#f87171",margin:"0 0 12px"}}>{error}</p>}
          <button onClick={handleActivate} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:12,background:"#f59e0b",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"'Jost',sans-serif",fontSize:15,fontWeight:600,color:"#09090b",opacity:loading?0.7:1,marginBottom:10}}>{loading?"Verifying…":"Activate Pro"}</button>
          <button onClick={()=>{setMode("pitch");setError("");}} style={{width:"100%",background:"none",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim,padding:"8px"}}>← Back</button>
        </>)}
      </div>
    </div>
  );
}

function ProPage({onBack,T,isPro,graceTokens,onOpenPaywall}){
  const PS={fontFamily:"'Jost',sans-serif",fontSize:15,color:T.muted,lineHeight:1.7,margin:"0 0 10px"};
  return(
    <div style={{minHeight:"100vh",background:T.bg,transition:"background 0.3s"}}>
      <PageHeader title="Get Pro" onBack={onBack} T={T}/>
      <div style={{padding:"24px 20px 80px",maxWidth:480,margin:"0 auto"}}>
        {isPro?(<div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:52,marginBottom:16}}>✦</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"#f59e0b",margin:"0 0 10px"}}>You're Pro</h1>
          <p style={{...PS,textAlign:"center"}}>You have full access to all Pro features.</p>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px",marginTop:24,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{fontSize:22}}>🛡️</div>
            <div><div style={{fontFamily:"'Jost',sans-serif",fontSize:15,color:T.text,fontWeight:500}}>{graceTokens} grace token{graceTokens!==1?"s":""} remaining</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.dim,marginTop:2}}>Resets at the start of each month</div></div>
          </div>
        </div>):(<>
          <div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:52,marginBottom:16}}>✦</div><h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color:T.text,margin:"0 0 12px",lineHeight:1.15}}>Upgrade to Pro</h1><p style={{...PS,textAlign:"center",margin:0}}>Unlock the full depth of your practice.</p></div>
          {[["📊","Detailed Analytics","See your strongest and weakest habit, best day of the week, and which specific action you skip most — based on the last 30 days of data."],["✏️","Custom Actions","Add your own specific actions to any of the 7 habits. Rewrite existing ones in your own words. The score updates automatically."],["📤","Export History","Download your full practice history as a CSV spreadsheet or formatted PDF report. Share to email, WhatsApp, or any app."],["🛡️","Streak Protection","2 grace tokens per month that protect your streak when life happens. Resets at the start of every month."]].map(([icon,title,desc])=>(
            <div key={title} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px",marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{fontSize:24,flexShrink:0,marginTop:2}}>{icon}</div>
              <div><div style={{fontFamily:"'Jost',sans-serif",fontWeight:600,fontSize:16,color:T.text,marginBottom:6}}>{title}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.muted,lineHeight:1.6}}>{desc}</div></div>
            </div>
          ))}
          <div style={{marginTop:24}}>
            <a href={SELAR_URL} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"16px",borderRadius:14,background:"#f59e0b",textAlign:"center",fontFamily:"'Jost',sans-serif",fontSize:17,fontWeight:700,color:"#09090b",textDecoration:"none",boxSizing:"border-box",marginBottom:12}}>Get Pro on Selar →</a>
            <button onClick={onOpenPaywall} style={{width:"100%",padding:"16px",borderRadius:14,background:"none",border:`1px solid ${T.border}`,fontFamily:"'Jost',sans-serif",fontSize:16,color:T.textSub,cursor:"pointer"}}>I already have a key</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function AboutPage({onBack,T}){
  const[openFaq,setOpenFaq]=useState(null);
  const PS={fontFamily:"'Jost',sans-serif",fontSize:16,color:T.muted,lineHeight:1.75,margin:"0 0 12px"};
  const HS={fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:T.text,margin:"0 0 16px"};
  const FAQS=[{q:"Do I need to complete all actions every day?",a:"No. Consistent progress matters more than perfection. Even 8–10 actions practised intentionally each day builds real momentum over time."},{q:"How is my daily score calculated?",a:"It's the percentage of all actions you checked off — including any custom actions you've added as a Pro user. It's a mirror, not a judgment."},{q:"Will my data sync across devices?",a:"Yes. As long as you're signed in with the same account, your history syncs automatically across all your devices."},{q:"What does Pro include?",a:"Pro unlocks detailed analytics, custom actions inside each habit, history export (CSV & PDF), and streak protection grace tokens."},{q:"Why are habits grouped into three sections?",a:"Habits 1–3 (Private Victory) — master yourself. Habits 4–6 (Public Victory) — work effectively with others. Habit 7 (Renewal) — sustain everything."}];
  return(
    <div style={{minHeight:"100vh",background:T.bg,transition:"background 0.3s"}}>
      <PageHeader title="About the Book" onBack={onBack} T={T}/>
      <div style={{padding:"24px 20px 80px",maxWidth:480,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:52,marginBottom:16}}>📖</div><h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:700,color:T.text,margin:"0 0 12px",lineHeight:1.15}}>7 Habits Tracker</h1><p style={{fontFamily:"'Jost',sans-serif",fontSize:16,color:T.muted,lineHeight:1.7,margin:0}}>A daily practice companion built on Stephen R. Covey's framework for enduring personal effectiveness.</p></div>
        <div style={{height:1,background:"linear-gradient(to right, transparent, #f59e0b44, transparent)",marginBottom:32}}/>
        <div style={{marginBottom:36}}><h2 style={HS}>About the Book</h2><p style={PS}><em style={{color:T.textSub}}>The 7 Habits of Highly Effective People</em> by Stephen R. Covey (1989) is one of the most influential personal development books ever written. Its core premise: lasting effectiveness comes from character, not technique.</p><p style={PS}>The habits are sequential — building on each other, moving you from dependence through independence to interdependence.</p></div>
        {[{label:"Private Victory",ids:[1,2,3],desc:"Master yourself before you can effectively lead others.",color:GC[0]},{label:"Public Victory",ids:[4,5,6],desc:"Build trust and create lasting collaborative outcomes.",color:GC[1]},{label:"Renewal",ids:[7],desc:"Sustain your capacity to keep practising everything else.",color:GC[2]}].map(g=>(
          <div key={g.label} style={{marginBottom:36}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{width:4,height:16,borderRadius:2,background:g.color,flexShrink:0}}/><span style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:g.color}}>{g.label}</span></div>
            <p style={{...PS,marginBottom:14}}>{g.desc}</p>
            {HABITS.filter(h=>g.ids.includes(h.id)).map(h=>(
              <div key={h.id} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:g.color+"18",border:`1px solid ${g.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,fontWeight:700,color:g.color,fontFamily:"'Jost',sans-serif",marginTop:2}}>{h.id}</div>
                <div><div style={{fontFamily:"'Jost',sans-serif",fontWeight:600,fontSize:17,color:T.text,marginBottom:5}}>{h.name}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:15,color:T.muted,lineHeight:1.6}}>{h.desc}</div></div>
              </div>
            ))}
          </div>
        ))}
        <div><h2 style={HS}>FAQs</h2>{FAQS.map((f,i)=>(<div key={i} style={{borderBottom:`1px solid ${T.border}`}}><button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"15px 0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,textAlign:"left"}}><span style={{fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:500,color:T.textSub,lineHeight:1.45}}>{f.q}</span><span style={{color:T.dim,fontSize:22,flexShrink:0}}>{openFaq===i?"−":"+"}</span></button>{openFaq===i&&<p style={{...PS,paddingBottom:14,marginTop:-6}}>{f.a}</p>}</div>))}</div>
      </div>
    </div>
  );
}

function SettingsPage({onBack,T,dark,onToggleTheme,user,onSignOut,settings,onSave,viewMode,onSetViewMode,userName,onSaveName}){
  const[enabled,setEnabled]=useState(settings.enabled),[time,setTime]=useState(settings.time||"20:00");
  const[permStatus,setPermStatus]=useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const[editName,setEditName]=useState(false),[nameVal,setNameVal]=useState(userName||"");
  const PS={fontFamily:"'Jost',sans-serif",fontSize:15,color:T.muted,lineHeight:1.65,margin:"0 0 10px"};
  const notifTimer=useRef(null);
  const handleToggleNotif=async()=>{if(!enabled){if(typeof Notification==="undefined"){alert("Not supported.");return;}const perm=await Notification.requestPermission();setPermStatus(perm);if(perm==="granted"){setEnabled(true);onSave({enabled:true,time});}}else{setEnabled(false);onSave({enabled:false,time});}};
  const Toggle=({on,onPress})=>(<button onClick={onPress} style={{width:52,height:30,borderRadius:15,background:on?"#f59e0b":T.veryDim,border:"none",cursor:"pointer",position:"relative",transition:"background 0.25s",flexShrink:0}}><div style={{width:24,height:24,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?25:3,transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/></button>);
  return(
    <div style={{minHeight:"100vh",background:T.bg,transition:"background 0.3s"}}>
      <PageHeader title="Settings" onBack={onBack} T={T}/>
      <div style={{padding:"20px 20px 80px",maxWidth:480,margin:"0 auto"}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",marginBottom:14,transition:"background 0.3s"}}>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#f59e0b",marginBottom:6}}>Account</div>
          <p style={{...PS,marginBottom:14}}>Signed in as <strong style={{color:T.textSub}}>{user?.email}</strong>. Progress syncs across all your devices.</p>
          <div style={{marginBottom:16}}>
            <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.dim,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.07em"}}>Your name</div>
            {editName?(<div style={{display:"flex",gap:8}}><input value={nameVal} onChange={e=>setNameVal(e.target.value)} style={{flex:1,padding:"10px 12px",background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:10,fontFamily:"'Jost',sans-serif",fontSize:15,color:T.text,outline:"none"}} autoFocus/><button onClick={()=>{onSaveName(nameVal.trim()||"Friend");setEditName(false);}} style={{background:"#f59e0b",border:"none",borderRadius:10,padding:"10px 16px",fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#09090b",cursor:"pointer"}}>Save</button></div>)
            :(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Jost',sans-serif",fontSize:16,color:T.text}}>{userName||"Not set"}</span><button onClick={()=>setEditName(true)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim,cursor:"pointer"}}>Edit</button></div>)}
          </div>
          <button onClick={onSignOut} style={{background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 18px",fontFamily:"'Jost',sans-serif",fontSize:14,color:"#f87171",cursor:"pointer",fontWeight:500}}>Sign out</button>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",marginBottom:14,transition:"background 0.3s"}}>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#f59e0b",marginBottom:6}}>Checklist Layout</div>
          <p style={{...PS,marginBottom:14}}>Choose how habits appear in your daily check-in.</p>
          <div style={{display:"flex",gap:6,background:T.cardInner,borderRadius:12,padding:4}}>
            {[{id:"list",icon:"☰",label:"List"},{id:"grid",icon:"⊞",label:"Grid"}].map(v=>(
              <button key={v.id} onClick={()=>onSetViewMode(v.id)} style={{flex:1,padding:"10px 8px",borderRadius:9,background:viewMode===v.id?T.dark?"#27272a":"#fff":"transparent",border:viewMode===v.id?`1px solid ${T.border}`:"1px solid transparent",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:15,color:viewMode===v.id?T.text:T.dim,fontWeight:viewMode===v.id?600:400,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background 0.2s,color 0.2s",boxShadow:viewMode===v.id?"0 1px 4px rgba(0,0,0,0.15)":"none"}}><span style={{fontSize:16}}>{v.icon}</span>{v.label}</button>
            ))}
          </div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",marginBottom:14,transition:"background 0.3s"}}>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#f59e0b",marginBottom:16}}>Appearance</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Jost',sans-serif",fontSize:16,color:T.textSub}}>{dark?"🌙 Dark mode":"☀️ Light mode"}</span><Toggle on={dark} onPress={onToggleTheme}/></div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",marginBottom:14,transition:"background 0.3s"}}>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#f59e0b",marginBottom:6}}>Daily Reminder</div>
          <p style={{...PS,marginBottom:16}}>Get a notification each day at your chosen time.</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:enabled?18:0}}><span style={{fontFamily:"'Jost',sans-serif",fontSize:16,color:T.textSub}}>Enable reminders</span><Toggle on={enabled} onPress={handleToggleNotif}/></div>
          {enabled&&(<div><label style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.dim,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Reminder time</label><input type="time" value={time} onChange={e=>{setTime(e.target.value);if(enabled)onSave({enabled:true,time:e.target.value});}} style={{background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 14px",fontFamily:"'Jost',sans-serif",fontSize:17,color:T.text,outline:"none",width:"100%",boxSizing:"border-box",colorScheme:dark?"dark":"light"}}/></div>)}
          {permStatus==="denied"&&<p style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:"#f87171",margin:"12px 0 0",lineHeight:1.55}}>Notifications blocked. Enable them in your browser or phone settings.</p>}
        </div>
      </div>
    </div>
  );
}

function SubHabitList({habitId,defaultSubs,customActionsForHabit,checkedMap,onToggle,customSubs,onUpdateCustomSub,isPro,onRequirePro,onAddAction,onDeleteAction,T}){
  const gc=GC[HABITS.find(h=>h.id===habitId)?.gi??0];
  const[editingId,setEditingId]=useState(null),[editVal,setEditVal]=useState("");
  const[addingAction,setAddingAction]=useState(false),[newActionText,setNewActionText]=useState("");
  const getSubText=s=>customSubs?.[s.id]||s.text;
  const startEdit=s=>{if(!isPro){onRequirePro();return;}setEditingId(s.id);setEditVal(getSubText(s));};
  const saveEdit=sid=>{const def=defaultSubs.find(s=>s.id===sid)?.text||"";onUpdateCustomSub(sid,editVal.trim()||def);setEditingId(null);};
  const handleSaveAction=()=>{if(!newActionText.trim())return;onAddAction(habitId,newActionText.trim());setNewActionText("");setAddingAction(false);};
  const SubRow=({s,isCustomAction=false})=>(<div style={{padding:"11px 0",borderBottom:`1px solid ${T.divider}`}}>
    {editingId===s.id?(<div><textarea value={editVal} onChange={e=>setEditVal(e.target.value)} style={{display:"block",width:"100%",background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",fontFamily:"'Jost',sans-serif",fontSize:14,color:T.text,resize:"none",height:60,outline:"none",lineHeight:1.5,boxSizing:"border-box",marginBottom:8}}/><div style={{display:"flex",gap:8}}><button onClick={()=>saveEdit(s.id)} style={{background:gc,border:"none",borderRadius:6,padding:"6px 14px",fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:"#09090b",cursor:"pointer"}}>Save</button><button onClick={()=>{onUpdateCustomSub(s.id,null);setEditingId(null);}} style={{background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 12px",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.muted,cursor:"pointer"}}>Reset</button><button onClick={()=>setEditingId(null)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim}}>Cancel</button></div></div>)
    :(<div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
      <div onClick={()=>onToggle(s.id)} style={{cursor:"pointer",flexShrink:0,marginTop:1}}>{checkedMap[s.id]?<div style={{width:24,height:24,borderRadius:"50%",background:gc,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 14 14"><path d="M2 7l4 4 6-6" stroke={T.dark?"#09090b":"#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div>:<div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${T.veryDim}`}}/>}</div>
      <span onClick={()=>onToggle(s.id)} style={{flex:1,fontFamily:"'Jost',sans-serif",fontSize:14,color:checkedMap[s.id]?T.dim:T.textSub,lineHeight:1.55,cursor:"pointer",transition:"color 0.2s"}}><em style={{fontStyle:"normal",fontWeight:700,color:checkedMap[s.id]?T.dim:gc}}>I </em>{isCustomAction?s.text:getSubText(s)} today.{isCustomAction&&<span style={{background:gc+"22",color:gc,fontSize:10,padding:"1px 5px",borderRadius:4,marginLeft:6,fontWeight:600}}>custom</span>}{!isCustomAction&&customSubs?.[s.id]&&<span style={{color:gc,marginLeft:4,fontSize:10}}>✦</span>}</span>
      {isCustomAction?(<button onClick={()=>onDeleteAction(habitId,s.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 0 6px",fontSize:13,color:T.veryDim,flexShrink:0}}>✕</button>):(<button onClick={()=>startEdit(s)} style={{background:"none",border:"none",cursor:"pointer",padding:"0 0 0 6px",fontSize:13,opacity:0.4,flexShrink:0}}>{isPro?"✏️":"🔒"}</button>)}
    </div>)}
  </div>);
  return(<div>{defaultSubs.map(s=><SubRow key={s.id} s={s}/>)}{customActionsForHabit.map(a=><SubRow key={a.id} s={a} isCustomAction/>)}
    <div style={{paddingTop:12}}>{addingAction?(<div><div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim,marginBottom:6}}><em style={{fontStyle:"normal",fontWeight:700,color:gc}}>I </em>... today.</div><textarea value={newActionText} onChange={e=>setNewActionText(e.target.value)} placeholder="describe what you actually did..." autoFocus style={{display:"block",width:"100%",background:T.cardInner,border:`1px solid ${gc}66`,borderRadius:10,padding:"10px 12px",fontFamily:"'Jost',sans-serif",fontSize:14,color:T.text,resize:"none",height:68,outline:"none",lineHeight:1.5,boxSizing:"border-box",marginBottom:10}}/><div style={{display:"flex",gap:8}}><button onClick={handleSaveAction} style={{background:gc,border:"none",borderRadius:8,padding:"8px 18px",fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#09090b",cursor:"pointer"}}>Add</button><button onClick={()=>{setAddingAction(false);setNewActionText("");}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 14px",fontFamily:"'Jost',sans-serif",fontSize:14,color:T.dim,cursor:"pointer"}}>Cancel</button></div></div>)
    :(isPro?<button onClick={()=>setAddingAction(true)} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"9px 14px",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><span style={{color:gc,fontWeight:700,fontSize:15}}>+</span> Add custom action</button>:<button onClick={onRequirePro} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"9px 14px",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.veryDim,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>🔒 Add custom action — Pro</button>)}</div>
  </div>);
}

function GridHabitCard({habit,subs,customActionsCount,checkedMap,T,onClick}){
  const gc=GC[habit.gi];
  const totalForHabit=subs.length+customActionsCount;
  const done=subs.filter(s=>checkedMap[s.id]).length;
  const pct=totalForHabit>0?Math.round((done/totalForHabit)*100):0;
  const allDone=done===totalForHabit&&totalForHabit>0;
  return(<div onClick={onClick} style={{background:allDone?gc+"18":T.card,border:`1px solid ${allDone?gc+"66":T.border}`,borderRadius:14,padding:"10px 10px 36px",cursor:"pointer",position:"relative",overflow:"hidden",minHeight:130,transition:"border-color 0.25s,background 0.25s",WebkitTapHighlightColor:"transparent"}} onTouchStart={e=>e.currentTarget.style.transform="scale(0.96)"} onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:allDone?gc:gc+"44",borderRadius:"14px 14px 0 0"}}/>
    <div style={{width:22,height:22,borderRadius:"50%",background:allDone?gc:T.cardInner,color:allDone?(T.dark?"#09090b":"#fff"):T.dim,border:`1px solid ${allDone?"transparent":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,fontFamily:"'Jost',sans-serif",marginBottom:8,transition:"background 0.2s"}}>{habit.id}</div>
    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.25,marginBottom:3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{habit.name}</div>
    <div style={{fontFamily:"'Jost',sans-serif",fontSize:9,color:gc,lineHeight:1.3}}>{habit.tag}</div>
    <div style={{position:"absolute",bottom:10,left:10,right:10}}>
      <div style={{height:2,background:T.divider,borderRadius:1,marginBottom:5,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:gc,borderRadius:1,transition:"width 0.4s ease"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",gap:2}}>{subs.map(s=><div key={s.id} style={{width:4,height:4,borderRadius:"50%",background:checkedMap[s.id]?gc:T.veryDim}}/>)}</div><span style={{fontFamily:"'Jost',sans-serif",fontSize:9,color:T.dim,fontWeight:600}}>{done}/{totalForHabit}</span></div>
    </div>
  </div>);
}

function HabitSheet({habit,subs,customActionsForHabit,checkedMap,onToggle,note,onNote,T,isPro,customSubs,onUpdateCustomSub,onRequirePro,onAddAction,onDeleteAction,onClose}){
  const[visible,setVisible]=useState(false),[refExp,setRefExp]=useState(!!note);
  const gc=GC[habit.gi];
  const allSubs=[...subs,...customActionsForHabit];
  const done=allSubs.filter(s=>checkedMap[s.id]).length,total=allSubs.length;
  useEffect(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>setVisible(true)));return()=>{};}, []);
  const handleClose=()=>{setVisible(false);setTimeout(onClose,320);};
  return(<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end"}}>
    <div onClick={handleClose} style={{position:"absolute",inset:0,background:`rgba(0,0,0,${visible?0.65:0})`,transition:"background 0.32s ease"}}/>
    <div style={{position:"relative",width:"100%",zIndex:1,background:T.sheetBg,borderRadius:"22px 22px 0 0",maxWidth:480,margin:"0 auto",maxHeight:"85vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 24px)",boxShadow:"0 -8px 40px rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",justifyContent:"center",padding:"12px 0"}}><div style={{width:36,height:4,borderRadius:2,background:T.veryDim}}/></div>
      <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0,paddingRight:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:3,height:12,borderRadius:2,background:gc,flexShrink:0}}/><span style={{fontFamily:"'Jost',sans-serif",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.09em",color:gc}}>{GROUP_LABELS[habit.gi]}</span></div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:T.text,lineHeight:1.2,marginBottom:2}}>{habit.name}</div>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.dim}}>{habit.tag}</div>
        </div>
        <button onClick={handleClose} style={{width:32,height:32,borderRadius:"50%",background:T.cardInner,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.dim,fontSize:14,flexShrink:0}}>✕</button>
      </div>
      <div style={{padding:"12px 20px 0"}}>
        <div style={{height:3,background:T.divider,borderRadius:2,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:total>0?`${(done/total)*100}%`:"0%",background:gc,borderRadius:2,transition:"width 0.4s ease"}}/></div>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.dim}}>{done} of {total}{done===total&&total>0?" · ✦ All done":" remaining"}</div>
      </div>
      <div style={{padding:"8px 20px 0"}}><SubHabitList habitId={habit.id} defaultSubs={subs} customActionsForHabit={customActionsForHabit} checkedMap={checkedMap} onToggle={onToggle} customSubs={customSubs} onUpdateCustomSub={onUpdateCustomSub} isPro={isPro} onRequirePro={onRequirePro} onAddAction={onAddAction} onDeleteAction={onDeleteAction} T={T}/></div>
      <div style={{padding:"12px 20px 0"}}>
        <button onClick={()=>setRefExp(!refExp)} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"'Jost',sans-serif",fontSize:13,color:refExp?gc:T.veryDim,display:"flex",alignItems:"center",gap:4}}><span>{refExp?"▾":"▸"}</span><span>{note?"Edit reflection":"Add reflection"}</span></button>
        {refExp&&<textarea value={note} onChange={e=>onNote(e.target.value)} placeholder="What did this look like for you today?" style={{display:"block",width:"100%",marginTop:8,background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontFamily:"'Jost',sans-serif",fontSize:14,color:T.text,resize:"none",height:80,outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>}
        {!refExp&&note&&<p style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.veryDim,margin:"6px 0 0",lineHeight:1.4,fontStyle:"italic"}}>"{note.length>80?note.slice(0,80)+"…":note}"</p>}
      </div>
    </div>
  </div>);
}

function HabitCard({habit,defaultSubs,customActionsForHabit,checkedMap,onToggle,note,onNote,T,isPro,customSubs,onUpdateCustomSub,onRequirePro,onAddAction,onDeleteAction}){
  const[exp,setExp]=useState(false),[refExp,setRefExp]=useState(false);
  const gc=GC[habit.gi];
  const allSubs=[...defaultSubs,...customActionsForHabit];
  const done=allSubs.filter(s=>checkedMap[s.id]).length,allDone=done===allSubs.length&&allSubs.length>0;
  return(<div style={{background:T.card,borderRadius:14,marginBottom:10,border:`1px solid ${allDone?gc+"55":exp?T.veryDim:T.border}`,transition:"border-color 0.25s ease,background 0.3s",overflow:"hidden"}}>
    <button onClick={()=>setExp(!exp)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"13px 14px",display:"flex",gap:12,alignItems:"center",textAlign:"left"}}>
      <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:allDone?gc:T.cardInner,color:allDone?(T.dark?"#09090b":"#fff"):T.dim,border:`1px solid ${allDone?"transparent":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,fontFamily:"'Jost',sans-serif",transition:"background 0.2s"}}>{habit.id}</div>
      <div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Jost',sans-serif",fontWeight:600,fontSize:16,color:T.text,lineHeight:1.3}}>{habit.name}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:gc,marginTop:2}}>{habit.tag}</div></div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <div style={{display:"flex",gap:4}}>{defaultSubs.map(s=><div key={s.id} style={{width:7,height:7,borderRadius:"50%",background:checkedMap[s.id]?gc:T.veryDim,transition:"background 0.2s"}}/>)}{customActionsForHabit.map(a=><div key={a.id} style={{width:7,height:7,borderRadius:"50%",background:checkedMap[a.id]?gc:gc+"33",border:`1px solid ${gc}55`}}/>)}</div>
        <span style={{color:T.dim,fontSize:13}}>{exp?"▴":"▾"}</span>
      </div>
    </button>
    {exp&&(<div style={{borderTop:`1px solid ${T.border}`}}>
      <div style={{padding:"4px 14px 12px"}}><SubHabitList habitId={habit.id} defaultSubs={defaultSubs} customActionsForHabit={customActionsForHabit} checkedMap={checkedMap} onToggle={onToggle} customSubs={customSubs} onUpdateCustomSub={onUpdateCustomSub} isPro={isPro} onRequirePro={onRequirePro} onAddAction={onAddAction} onDeleteAction={onDeleteAction} T={T}/></div>
      <div style={{padding:"0 14px 12px",borderTop:`1px solid ${T.divider}`}}>
        <button onClick={()=>setRefExp(!refExp)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 0 0",fontFamily:"'Jost',sans-serif",fontSize:12,color:refExp?gc:T.veryDim,display:"flex",alignItems:"center",gap:4}}><span>{refExp?"▾":"▸"}</span><span>{note?"Edit reflection":"Add reflection"}</span></button>
        {refExp&&<textarea value={note} onChange={e=>onNote(e.target.value)} placeholder="What did this look like for you today?" style={{display:"block",width:"100%",marginTop:6,background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",fontFamily:"'Jost',sans-serif",fontSize:13,color:T.text,resize:"none",height:70,outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>}
        {!refExp&&note&&<p style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.veryDim,margin:"4px 0 0",lineHeight:1.4,fontStyle:"italic"}}>"{note.length>80?note.slice(0,80)+"…":note}"</p>}
      </div>
    </div>)}
  </div>);
}

function DailyTab({habits,notes,onToggle,onNote,T,isPro,customSubs,customActions,onUpdateCustomSub,onAddAction,onDeleteAction,onRequirePro,viewMode}){
  const[activeSheet,setActiveSheet]=useState(null);
  const totalSubs=getTotalSubs(customActions);
  const s=calcScore(habits,totalSubs);
  const done=Object.values(habits).filter(Boolean).length;
  const groups=[{gi:0,label:"Private Victory",color:GC[0]},{gi:1,label:"Public Victory",color:GC[1]},{gi:2,label:"Renewal",color:GC[2]}];
  const isGrid=viewMode==="grid";
  return(<div style={{padding:"12px 16px 120px",maxWidth:480,margin:"0 auto"}}>
    {activeSheet&&<HabitSheet habit={activeSheet} subs={DEFAULT_SUBS[activeSheet.id]} customActionsForHabit={customActions[activeSheet.id]||[]} checkedMap={habits} onToggle={onToggle} note={notes[activeSheet.id]||""} onNote={v=>onNote(activeSheet.id,v)} T={T} isPro={isPro} customSubs={customSubs} onUpdateCustomSub={onUpdateCustomSub} onRequirePro={onRequirePro} onAddAction={onAddAction} onDeleteAction={onDeleteAction} onClose={()=>setActiveSheet(null)}/>}
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:14,padding:"8px 0 16px"}}>
      <ScoreRing pct={s} size={86} T={T}/>
      <div><div style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.dim}}>{done}/{totalSubs} actions today</div>{done===totalSubs&&totalSubs>0&&<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#34d399",marginTop:2}}>All done. ✦</div>}</div>
    </div>
    {groups.map((g,gi)=>{const groupHabits=HABITS.filter(h=>h.gi===g.gi);return(<div key={g.gi}>
      <div style={{display:"flex",alignItems:"center",gap:8,margin:gi===0?"0 0 12px":"18px 0 12px"}}><div style={{width:3,height:12,borderRadius:2,background:g.color,flexShrink:0}}/><span style={{fontFamily:"'Jost',sans-serif",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.09em",color:g.color}}>{g.label}</span></div>
      {isGrid?(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:4}}>{groupHabits.map(h=><GridHabitCard key={h.id} habit={h} subs={DEFAULT_SUBS[h.id]} customActionsCount={(customActions[h.id]||[]).length} checkedMap={habits} T={T} onClick={()=>setActiveSheet(h)}/>)}</div>)
      :(<div>{groupHabits.map(h=><HabitCard key={h.id} habit={h} defaultSubs={DEFAULT_SUBS[h.id]} customActionsForHabit={customActions[h.id]||[]} checkedMap={habits} onToggle={onToggle} note={notes[h.id]||""} onNote={v=>onNote(h.id,v)} T={T} isPro={isPro} customSubs={customSubs} onUpdateCustomSub={onUpdateCustomSub} onRequirePro={onRequirePro} onAddAction={onAddAction} onDeleteAction={onDeleteAction}/>)}</div>)}
    </div>);})}
    {done===totalSubs&&totalSubs>0&&<div style={{textAlign:"center",padding:"20px 0 4px",fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#34d399"}}>All {totalSubs} actions completed today. ✦</div>}
  </div>);
}

function JournalSection({logs,T}){
  const[openDay,setOpenDay]=useState(null);
  const entries=Object.entries(logs).filter(([,log])=>log.score>0||Object.values(log.notes||{}).some(n=>n?.trim())).sort(([a],[b])=>b.localeCompare(a)).slice(0,30);
  if(!entries.length)return null;
  return(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 16px",marginBottom:14,transition:"background 0.3s"}}>
    <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:T.textSub,marginBottom:4}}>Reflection Journal</div>
    <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.dim,marginBottom:14}}>Tap any day to read your notes</div>
    {entries.map(([date,log])=>{
      const notes=Object.entries(log.notes||{}).filter(([,n])=>n?.trim());
      const s=log.score||0,color=s>=70?"#34d399":s>=40?"#fbbf24":"#f87171",isOpen=openDay===date;
      return(<div key={date} style={{borderBottom:`1px solid ${T.divider}`}}>
        <div onClick={()=>setOpenDay(isOpen?null:date)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",cursor:"pointer"}}>
          <div><div style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.text,fontWeight:500}}>{fmtDate(date)}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:T.dim,marginTop:2}}>{notes.length>0?`📝 ${notes.length} reflection note${notes.length>1?"s":""}`:s>0?"No notes written":""}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color}}>{s}%</span><span style={{color:T.dim,fontSize:12}}>{isOpen?"▴":"▾"}</span></div>
        </div>
        {isOpen&&<div style={{paddingBottom:14}}>{notes.length>0?notes.map(([habitId,note])=>{const habit=HABITS.find(h=>h.id===parseInt(habitId));return(<div key={habitId} style={{marginBottom:10,padding:"12px 14px",background:T.cardInner,borderRadius:10}}><div style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:600,color:GC[habit?.gi??0],marginBottom:5}}>{habit?.name||"Habit"}</div><p style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.textSub,lineHeight:1.6,margin:0,fontStyle:"italic"}}>"{note}"</p></div>);}):<p style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.dim,fontStyle:"italic",margin:0,paddingBottom:4}}>No reflection notes for this day.</p>}</div>}
      </div>);
    })}
  </div>);
}

function ProAnalytics({logs,T,onRequirePro,isPro}){
  if(!isPro)return(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 16px",marginBottom:14,position:"relative",overflow:"hidden"}}>
    <div style={{filter:"blur(3px)",pointerEvents:"none",opacity:0.4}}><div style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:14}}>Pro Analytics</div>{[["Strongest","Be Proactive"],["Weakest","Synergize"],["Best day","Wednesday"]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.divider}`}}><span style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.muted}}>{l}</span><span style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:T.text}}>{v}</span></div>))}</div>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.dark?"rgba(9,9,11,0.7)":"rgba(247,247,242,0.8)",borderRadius:14}}><div style={{fontSize:28,marginBottom:8}}>🔒</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:T.text,marginBottom:4}}>Pro Analytics</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.muted,marginBottom:14,textAlign:"center"}}>Deep insights into your habit patterns</div><button onClick={onRequirePro} style={{background:"#f59e0b",border:"none",borderRadius:8,padding:"10px 20px",fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:"#09090b",cursor:"pointer"}}>Unlock Pro</button></div>
  </div>);
  const last30=lastNDays(30),loggedDays=last30.filter(d=>logs[d]);
  const habitStats=HABITS.map(h=>{const subs=DEFAULT_SUBS[h.id];let done=0,possible=0;loggedDays.forEach(d=>{possible+=subs.length;done+=subs.filter(s=>logs[d]?.habits?.[s.id]).length;});const rate=possible>0?Math.round((done/possible)*100):0;return{name:h.name.split(" ").slice(0,2).join(" "),rate,color:GC[h.gi]};});
  const strongest=habitStats.reduce((a,b)=>b.rate>a.rate?b:a,habitStats[0]);
  const weakest=habitStats.reduce((a,b)=>b.rate<a.rate?b:a,habitStats[0]);
  const dayScores=Array(7).fill(null).map(()=>({total:0,count:0}));
  last30.forEach(d=>{if(logs[d]?.score>0){const dow=new Date(d+"T12:00:00").getDay();dayScores[dow].total+=logs[d].score;dayScores[dow].count++;}});
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const bestDayIdx=dayScores.reduce((best,d,i)=>{const avg=d.count>0?d.total/d.count:0,bAvg=dayScores[best].count>0?dayScores[best].total/dayScores[best].count:0;return avg>bAvg?i:best;},0);
  const allSubs=Object.values(DEFAULT_SUBS).flat();
  const subStats=allSubs.map(s=>{let done=0;loggedDays.forEach(d=>{if(logs[d]?.habits?.[s.id])done++;});return{...s,skipRate:loggedDays.length>0?Math.round((1-done/loggedDays.length)*100):100};});
  const mostSkipped=subStats.sort((a,b)=>b.skipRate-a.skipRate)[0];
  const TT={background:T.card,border:`1px solid ${T.border}`,borderRadius:8,fontFamily:"'Jost',sans-serif",fontSize:12,color:T.text};
  return(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px",marginBottom:14}}>
    <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:4}}>Pro Analytics</div>
    <div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:T.dim,marginBottom:14}}>Based on last 30 days</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>{[{label:"Strongest",val:strongest?.name||"—",color:"#34d399"},{label:"Weakest",val:weakest?.name||"—",color:"#f87171"},{label:"Best Day",val:days[bestDayIdx],color:"#fbbf24"}].map(({label,val,color})=>(<div key={label} style={{background:T.cardInner,borderRadius:10,padding:"10px 8px",textAlign:"center"}}><div style={{fontFamily:"'Jost',sans-serif",fontSize:10,color:T.dim,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:700,color,lineHeight:1.3}}>{val}</div></div>))}</div>
    <div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:T.dim,marginBottom:8}}>Completion rate per habit</div>
    <ResponsiveContainer width="100%" height={130}><BarChart data={habitStats} layout="vertical" margin={{left:0,right:8,top:0,bottom:0}}><XAxis type="number" domain={[0,100]} tick={{fontSize:9,fill:T.dim}} axisLine={false} tickLine={false} tickCount={3} tickFormatter={v=>`${v}%`}/><YAxis type="category" dataKey="name" tick={{fontSize:10,fill:T.dim,fontFamily:"'Jost',sans-serif"}} axisLine={false} tickLine={false} width={52}/><Tooltip formatter={v=>[`${v}%`,"Completion"]} contentStyle={TT}/><Bar dataKey="rate" radius={[0,4,4,0]}>{habitStats.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
    {mostSkipped&&<div style={{marginTop:14,padding:"10px 12px",background:T.cardInner,borderRadius:10}}><div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:T.dim,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Most skipped action</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:T.textSub,lineHeight:1.5}}><em style={{fontStyle:"normal",fontWeight:700,color:"#f87171"}}>I </em>{mostSkipped.text} today. <span style={{color:T.dim,fontSize:11}}>Skipped {mostSkipped.skipRate}% of days</span></div></div>}
  </div>);
}

function HistoryPage({onBack,logs,T,isPro,onRequirePro,userEmail}){
  const l7=lastNDays(7).map(d=>({day:dayLabel(d),score:logs[d]?.score??0}));
  const wAvg=Math.round(l7.reduce((s,d)=>s+d.score,0)/7);
  const mKeys=monthDayKeys(),mData=mKeys.map(d=>{const[,,day]=d.split("-").map(Number);return{day,score:logs[d]?.score??0};});
  const loggedM=mKeys.filter(d=>logs[d]),mAvg=loggedM.length?Math.round(loggedM.reduce((s,d)=>s+(logs[d]?.score??0),0)/loggedM.length):0;
  const todayScore=logs[localKey()]?.score??0,allVals=Object.values(logs),total=allVals.length;
  const avg=total?Math.round(allVals.reduce((s,v)=>s+(v.score||0),0)/total):0;
  const streak=calcStreak(logs),best=calcBest(logs);
  const TT={background:T.card,border:`1px solid ${T.border}`,borderRadius:8,fontFamily:"'Jost',sans-serif",fontSize:12,color:T.text};
  const[loadingExport,setLoadingExport]=useState(null);
  return(<div style={{minHeight:"100vh",background:T.bg,transition:"background 0.3s"}}>
    <PageHeader title="Progress" onBack={onBack} T={T}/>
    <div style={{padding:"16px 16px 80px",maxWidth:480,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>{[{label:"Today",pct:todayScore},{label:"7-Day Avg",pct:wAvg},{label:"Month",pct:mAvg}].map(({label,pct})=>(<div key={label} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 8px",textAlign:"center",transition:"background 0.3s"}}><ScoreRing pct={pct} size={64} T={T}/><div style={{fontFamily:"'Jost',sans-serif",fontSize:10,color:T.dim,marginTop:6,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div></div>))}</div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px",marginBottom:14,transition:"background 0.3s"}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:T.textSub,marginBottom:14}}>Last 7 Days</div>
        <ResponsiveContainer width="100%" height={140}><BarChart data={l7} barCategoryGap="28%"><CartesianGrid vertical={false} stroke={T.divider}/><XAxis dataKey="day" tick={{fontSize:11,fontFamily:"'Jost',sans-serif",fill:T.dim}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:10,fontFamily:"'Jost',sans-serif",fill:T.dim}} axisLine={false} tickLine={false} tickCount={3}/><Tooltip contentStyle={TT} formatter={v=>[`${v}%`,"Score"]} cursor={{fill:T.divider}}/><Bar dataKey="score" fill="#f59e0b" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px",marginBottom:14,transition:"background 0.3s"}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:T.textSub,marginBottom:14}}>{new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
        <ResponsiveContainer width="100%" height={130}><LineChart data={mData}><CartesianGrid vertical={false} stroke={T.divider}/><XAxis dataKey="day" tick={{fontSize:10,fontFamily:"'Jost',sans-serif",fill:T.dim}} axisLine={false} tickLine={false} interval={4}/><YAxis domain={[0,100]} tick={{fontSize:10,fontFamily:"'Jost',sans-serif",fill:T.dim}} axisLine={false} tickLine={false} tickCount={3}/><Tooltip contentStyle={TT} formatter={v=>[`${v}%`,"Score"]}/><Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{r:4,fill:"#a78bfa"}}/></LineChart></ResponsiveContainer>
      </div>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px",marginBottom:14,transition:"background 0.3s"}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:T.textSub,marginBottom:14}}>All-Time</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{label:"Days Logged",val:total,icon:"📅"},{label:"Avg Score",val:`${avg}%`,icon:"📊"},{label:"Current Streak",val:`${streak}d`,icon:"🔥"},{label:"Best Streak",val:`${best}d`,icon:"🏆"}].map(({label,val,icon})=>(<div key={label} style={{background:T.cardInner,borderRadius:10,padding:"14px",textAlign:"center",transition:"background 0.3s"}}><div style={{fontSize:22,marginBottom:5}}>{icon}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:T.text,lineHeight:1}}>{val}</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:10,color:T.dim,marginTop:5,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div></div>))}</div>
      </div>
      {isPro?(<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px",marginBottom:14}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,color:"#f59e0b",marginBottom:4}}>Export History</div>
        <p style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:T.muted,margin:"0 0 14px",lineHeight:1.5}}>Download your full practice history. On mobile, share to email, WhatsApp, or any app.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={async()=>{setLoadingExport("csv");try{await exportCSV(logs);}catch(e){alert("Export failed: "+e.message);}setLoadingExport(null);}} disabled={loadingExport==="csv"} style={{flex:1,padding:"11px",borderRadius:10,background:T.cardInner,border:`1px solid ${T.border}`,fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:T.text,cursor:"pointer",opacity:loadingExport==="csv"?0.6:1}}>{loadingExport==="csv"?"Exporting…":"📊 Export CSV"}</button>
          <button onClick={()=>exportPDF(logs,userEmail)} style={{flex:1,padding:"11px",borderRadius:10,background:T.cardInner,border:`1px solid ${T.border}`,fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:T.text,cursor:"pointer"}}>📄 Export PDF</button>
        </div>
      </div>):(<div onClick={onRequirePro} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 14px",marginBottom:14,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}><div style={{fontSize:22}}>🔒</div><div><div style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:2}}>Export History</div><div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:T.muted}}>Download as CSV or PDF · Pro feature</div></div></div>)}
      <ProAnalytics logs={logs} T={T} isPro={isPro} onRequirePro={onRequirePro}/>
      <JournalSection logs={logs} T={T}/>
    </div>
  </div>);
}

function AuthScreen({T,initialMode,onBack}){
  const[mode,setMode]=useState(initialMode||"login"),[email,setEmail]=useState(""),[password,setPassword]=useState("");
  const[loading,setLoading]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");
  const inputStyle={display:"block",width:"100%",padding:"13px 14px",background:T.cardInner,border:`1px solid ${T.border}`,borderRadius:10,fontFamily:"'Jost',sans-serif",fontSize:15,color:T.text,outline:"none",boxSizing:"border-box",marginBottom:12};
  const handleSubmit=async()=>{setError("");setSuccess("");setLoading(true);try{if(mode==="signup"){const{error}=await supabase.auth.signUp({email,password});if(error)throw error;setSuccess("Account created. Signing you in…");}else{const{error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;}}catch(e){setError(e.message);}setLoading(false);};
  const handleReset=async()=>{if(!email){setError("Enter your email first.");return;}setLoading(true);const{error}=await supabase.auth.resetPasswordForEmail(email);if(error)setError(error.message);else setSuccess("Password reset email sent.");setLoading(false);};
  return(<div style={{minHeight:"100vh",background:"#09090b",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"16px 20px"}}><button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><ChevronLeft size={22} color="#a1a1aa"/><span style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:"#a1a1aa"}}>Back</span></button></div>
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:36}}><div style={{fontSize:40,marginBottom:12}}>📖</div><h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:700,color:"#fafafa",margin:"0 0 6px"}}>{mode==="signup"?"Create Account":"Welcome Back"}</h1><p style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:"#71717a",margin:0}}>{mode==="login"?"Sign in to sync your progress across devices.":"Start tracking your practice today."}</p></div>
        <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} style={{...inputStyle,background:"#18181b",border:"1px solid #27272a",color:"#fafafa"}}/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{...inputStyle,background:"#18181b",border:"1px solid #27272a",color:"#fafafa",marginBottom:16}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
        {error&&<p style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:"#f87171",margin:"0 0 12px",lineHeight:1.5}}>{error}</p>}
        {success&&<p style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:"#34d399",margin:"0 0 12px",lineHeight:1.5}}>{success}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"15px",borderRadius:12,background:"#f59e0b",border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:600,color:"#09090b",opacity:loading?0.7:1,marginBottom:12}}>{loading?"Please wait…":mode==="login"?"Sign In":"Create Account"}</button>
        {mode==="login"&&<button onClick={handleReset} style={{width:"100%",background:"none",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:13,color:"#52525b",padding:"4px 0"}}>Forgot password?</button>}
        <p style={{textAlign:"center",fontFamily:"'Jost',sans-serif",fontSize:14,color:"#52525b",marginTop:20}}>{mode==="login"?"Don't have an account? ":"Already have an account? "}<button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setSuccess("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#f59e0b",fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:600,padding:0}}>{mode==="login"?"Sign up":"Sign in"}</button></p>
      </div>
    </div>
  </div>);
}

export default function App(){
  const[page,setPage]=useState("daily");
  const[menuOpen,setMenuOpen]=useState(false);
  const[habits,setHabits]=useState({});
  const[notes,setNotes]=useState({});
  const[logs,setLogs]=useState({});
  const[ready,setReady]=useState(false);
  const[saved,setSaved]=useState(false);
  const[onboarded,setOnboarded]=useState(true);
  const[settings,setSettings]=useState({enabled:false,time:"20:00"});
  const[dark,setDark]=useState(true);
  const[viewMode,setViewMode]=useState("list");
  const[user,setUser]=useState(null);
  const[authReady,setAuthReady]=useState(false);
  const[authMode,setAuthMode]=useState(null);
  const[isPro,setIsPro]=useState(false);
  const[customSubs,setCustomSubs]=useState({});
  const[customActions,setCustomActions]=useState({});
  const[graceTokens,setGraceTokens]=useState(2);
  const[showPaywall,setShowPaywall]=useState(false);
  const[userName,setUserName]=useState("");
  const[greeting,setGreeting]=useState("");
  const timer=useRef(null),notifTimer=useRef(null),saveTimer=useRef(null);
  const T=makeTheme(dark);

  useEffect(()=>{const link=document.createElement("link");link.rel="stylesheet";link.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap";document.head.appendChild(link);},[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user??null);setAuthReady(true);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setUser(session?.user??null);});
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(userName&&!greeting){setGreeting(getGreeting(userName,new Date().getHours()));}
  },[userName]);

  useEffect(()=>{
    if(!authReady)return;
    const savedTheme=localStorage.getItem("theme");if(savedTheme)setDark(savedTheme==="dark");
    const savedView=localStorage.getItem("viewMode");if(savedView)setViewMode(savedView);
    const savedSettings=localStorage.getItem("settings");if(savedSettings){const s=JSON.parse(savedSettings);setSettings(s);if(s.enabled&&typeof Notification!=="undefined"&&Notification.permission==="granted")scheduleNotif(s.time,notifTimer);}
    const done=localStorage.getItem("onboarded");if(!done)setOnboarded(false);
    const loadData=async()=>{
      if(user){
        await ensureProfile(user);
        const profile=await fetchProfile(user.id);
        if(profile){setIsPro(profile.is_pro||false);setCustomSubs(profile.custom_subs||{});setCustomActions(profile.custom_habits||{});setGraceTokens(profile.grace_tokens??2);if(profile.name){setUserName(profile.name);setGreeting(getGreeting(profile.name,new Date().getHours()));}const thisMonth=localKey().slice(0,7);if(profile.grace_tokens_month!==thisMonth){await updateProfile(user.id,{grace_tokens:2,grace_tokens_month:thisMonth});setGraceTokens(2);}}
        const remoteLogs=await fetchAllLogs(user.id);setLogs(remoteLogs);const td=remoteLogs[localKey()];if(td){setHabits(td.habits||{});setNotes(td.notes||{});}
      }else{const localLogs=stor.all();setLogs(localLogs);const td=localLogs[localKey()];if(td){setHabits(td.habits||{});setNotes(td.notes||{});}}
      setReady(true);
    };
    loadData();
  },[authReady,user]);

  useEffect(()=>{
    if(!ready)return;
    const totalSubs=getTotalSubs(customActions),s=calcScore(habits,totalSubs);
    const log={habits,notes,score:s,date:localKey()};
    stor.set(`log:${localKey()}`,log);setLogs(prev=>({...prev,[localKey()]:log}));
    setSaved(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setSaved(false),2000);
    clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>{if(user)syncLog(user.id,localKey(),log);},1500);
  },[habits,notes,ready,customActions]);

  const handleActivatePro=async(key)=>{setIsPro(true);setShowPaywall(false);if(user){const h=await hashKey(key);await updateProfile(user.id,{is_pro:true,licence_key_hash:h});}};
  const handleUpdateCustomSub=async(subId,text)=>{const updated={...customSubs};if(text===null)delete updated[subId];else updated[subId]=text;setCustomSubs(updated);if(user)await updateProfile(user.id,{custom_subs:updated});};
  const handleAddAction=async(habitId,text)=>{const id=`ca_${habitId}_${Date.now()}`;const updated={...customActions,[habitId]:[...(customActions[habitId]||[]),{id,text}]};setCustomActions(updated);if(user)await updateProfile(user.id,{custom_habits:updated});};
  const handleDeleteAction=async(habitId,actionId)=>{const updated={...customActions,[habitId]:(customActions[habitId]||[]).filter(a=>a.id!==actionId)};const cleanedHabits={...habits};delete cleanedHabits[actionId];setHabits(cleanedHabits);setCustomActions(updated);if(user)await updateProfile(user.id,{custom_habits:updated});};
  const saveSettings=(ns)=>{setSettings(ns);localStorage.setItem("settings",JSON.stringify(ns));if(ns.enabled&&typeof Notification!=="undefined"&&Notification.permission==="granted")scheduleNotif(ns.time,notifTimer);else clearTimeout(notifTimer.current);};
  const toggleTheme=()=>{const next=!dark;setDark(next);localStorage.setItem("theme",next?"dark":"light");};
  const handleSetViewMode=(m)=>{setViewMode(m);localStorage.setItem("viewMode",m);};
  const handleSignOut=async()=>{await supabase.auth.signOut();setHabits({});setNotes({});setLogs({});setIsPro(false);setCustomSubs({});setCustomActions({});setUserName("");setGreeting("");};
  const handleOnboardingDone=async(name)=>{localStorage.setItem("onboarded","true");setOnboarded(true);if(name&&user){await updateProfile(user.id,{name});setUserName(name);setGreeting(getGreeting(name,new Date().getHours()));}};
  const handleSaveName=async(name)=>{setUserName(name);setGreeting(getGreeting(name,new Date().getHours()));if(user)await updateProfile(user.id,{name});};
  const requirePro=()=>setShowPaywall(true);

  const Spinner=()=><div style={{background:"#09090b",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:"'Jost',sans-serif",color:"#52525b",fontSize:14}}>Loading…</div></div>;

  if(!authReady)return<Spinner/>;
  if(!user){
    if(!authMode)return<LandingPage onSignUp={()=>setAuthMode("signup")} onLogin={()=>setAuthMode("login")}/>;
    return<AuthScreen T={T} initialMode={authMode} onBack={()=>setAuthMode(null)}/>;
  }
  if(!ready)return<Spinner/>;

  const date=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const displayGreeting=greeting||(userName?`Hi, ${userName}.`:"Welcome back.");

  return(<div style={{background:T.bg,minHeight:"100vh",transition:"background 0.3s"}}>
    {!onboarded&&<Onboarding onDone={handleOnboardingDone}/>}
    {showPaywall&&<Paywall onClose={()=>setShowPaywall(false)} onActivate={handleActivatePro} T={T} userId={user?.id}/>}
    {menuOpen&&<SideMenu onNavigate={setPage} onClose={()=>setMenuOpen(false)} T={T} isPro={isPro}/>}

    {page==="daily"&&(<>
      <TopBar greeting={displayGreeting} date={date} onMenuOpen={()=>setMenuOpen(true)} T={T} saved={saved}/>
      <DailyTab habits={habits} notes={notes} T={T} isPro={isPro} customSubs={customSubs} customActions={customActions} viewMode={viewMode}
        onToggle={id=>setHabits(p=>({...p,[id]:!p[id]}))} onNote={(id,v)=>setNotes(p=>({...p,[id]:v}))}
        onUpdateCustomSub={handleUpdateCustomSub} onAddAction={handleAddAction} onDeleteAction={handleDeleteAction} onRequirePro={requirePro}/>
      <FloatingHistoryBtn onPress={()=>setPage("history")}/>
    </>)}
    {page==="history"&&<HistoryPage onBack={()=>setPage("daily")} logs={logs} T={T} isPro={isPro} onRequirePro={requirePro} userEmail={user?.email}/>}
    {page==="settings"&&<SettingsPage onBack={()=>setPage("daily")} T={T} dark={dark} onToggleTheme={toggleTheme} user={user} onSignOut={handleSignOut} settings={settings} onSave={saveSettings} viewMode={viewMode} onSetViewMode={handleSetViewMode} userName={userName} onSaveName={handleSaveName}/>}
    {page==="pro"&&<ProPage onBack={()=>setPage("daily")} T={T} isPro={isPro} graceTokens={graceTokens} onOpenPaywall={requirePro}/>}
    {page==="about"&&<AboutPage onBack={()=>setPage("daily")} T={T}/>}
  </div>);
}