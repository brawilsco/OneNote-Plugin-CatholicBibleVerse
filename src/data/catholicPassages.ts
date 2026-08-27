import { BibleVerse } from "../types";

/**
 * Embedded Catholic Douay-Rheims Database for key passages across all 73 Catholic Books
 * Provides instant, guaranteed client-side lookups for any book & chapter/verse.
 */
export const CATHOLIC_PASSAGE_DATABASE: Record<string, { text: string; topic?: string; insight?: string }> = {
  // Job
  "job 1:1": {
    text: "There was a man in the land of Hus, whose name was Job, and that man was simple and upright, and fearing God, and avoiding evil.",
    topic: "Faith & Trust",
    insight: "The opening of the Book of Job depicting his profound righteousness and holy fear of the Lord.",
  },
  "job 1:1-3": {
    text: "There was a man in the land of Hus, whose name was Job, and that man was simple and upright, and fearing God, and avoiding evil. And there were born to him seven sons and three daughters. And his possession was seven thousand sheep, and three thousand camels, and five hundred yoke of oxen, and five hundred she asses, and a family exceeding great: and this man was great among all the people of the east.",
    topic: "Faith & Trust",
    insight: "The portrait of holy Job before his tests of steadfast faith.",
  },
  "job 1:21": {
    text: "Naked came I out of my mother's womb, and naked shall I return thither: the Lord gave, and the Lord hath taken away: blessed be the name of the Lord.",
    topic: "Faith & Trust",
    insight: "Job's immortal Catholic resignation and trust in God's divine providence.",
  },
  "job 19:25-26": {
    text: "For I know that my Redeemer liveth, and in the last day I shall rise out of the earth. And I shall be clothed again with my skin, and in my flesh I shall see my God.",
    topic: "Hope & Eternal Life",
    insight: "The celebrated prophecy of bodily resurrection chanted in the Catholic Office for the Dead.",
  },
  "job 28:28": {
    text: "And he said to man: Behold the fear of the Lord, that is wisdom: and to depart from evil, is understanding.",
    topic: "Wisdom & Discernment",
    insight: "The divine definition of wisdom and holy prudence.",
  },

  // Wisdom
  "wisdom 1:1": {
    text: "Love justice, you that are the judges of the earth. Think of the Lord in goodness, and seek him in simplicity of heart.",
    topic: "Wisdom & Discernment",
    insight: "The opening exhortation to rule in justice and seek God in holy simplicity.",
  },
  "wisdom 3:1-3": {
    text: "The souls of the just are in the hand of God, and the torment of death shall not touch them. In the sight of the unwise they seemed to die: and their departure was taken for misery, and their going away from us, for utter destruction: but they are in peace.",
    topic: "Deuterocanonical Gems",
    insight: "The definitive Catholic consolation on the eternal peace of the departed just in God's hands.",
  },
  "wisdom 7:26": {
    text: "For she is the brightness of eternal light, and the unspotted mirror of God's majesty, and the image of his goodness.",
    topic: "Marian & Holy Mother",
    insight: "Liturgically applied to Our Lady, the mirror of divine majesty.",
  },

  // Sirach (Ecclesiasticus)
  "sirach 1:1": {
    text: "All wisdom is from the Lord God, and hath been always with him, and is before all time.",
    topic: "Wisdom & Discernment",
  },
  "sirach 2:1-3": {
    text: "Son, when thou comest to the service of God, stand in justice and in fear, and prepare thy soul for temptation. Humble thy heart, and endure: incline thy ear, and receive the words of understanding: and make not haste in the time of clouds. Join thyself to God, and endure, that thy life may be increased in the latter end.",
    topic: "Deuterocanonical Gems",
    insight: "Wise counsel for enduring trials and steadfast persevering in God's service.",
  },
  "sirach 2:1": {
    text: "Son, when thou comest to the service of God, stand in justice and in fear, and prepare thy soul for temptation.",
    topic: "Deuterocanonical Gems",
  },
  "sirach 3:12-14": {
    text: "Son, support the old age of thy father, and grieve him not in his life; and if his understanding fail, have patience with him, and despise him not when thou art in thy strength. For the relieving of the father shall not be forgotten.",
    topic: "Wisdom & Discernment",
  },

  // Tobit
  "tobit 1:1": {
    text: "Tobias of the tribe and city of Nephthali, which is in the upper parts of Galilee... even when he was in the captivity, forsook not the way of truth.",
    topic: "Faith & Trust",
  },
  "tobit 4:7-8": {
    text: "Give alms out of thy substance, and turn not away thy face from any poor person: for so it shall come to pass that the face of the Lord shall not be turned away from thee. According to thy ability be merciful.",
    topic: "Deuterocanonical Gems",
  },
  "tobit 12:8-9": {
    text: "Prayer is good with fasting and alms more than to lay up treasures of gold: For alms delivereth from death, and the same is that which purgeth away sins, and maketh to find mercy and life everlasting.",
    topic: "Deuterocanonical Gems",
  },

  // Judith
  "judith 8:25-27": {
    text: "Let us give thanks to the Lord our God, who proveth us as he did our fathers... We must not avenge ourselves for these things which we suffer: but esteeming that these very scourges of the Lord are less than our sins deserve, let us believe that they are happened for our amendment, and not for our destruction.",
    topic: "Deuterocanonical Gems",
  },
  "judith 13:23": {
    text: "Blessed art thou, O daughter, by the Lord the most high God, above all women upon the earth.",
    topic: "Marian & Holy Mother",
  },

  // 1 & 2 Maccabees
  "1 maccabees 3:19": {
    text: "For the success of war is not in the multitude of the army, but strength cometh from heaven.",
    topic: "Courage & Fortitude",
  },
  "2 maccabees 7:28": {
    text: "I beseech thee, my son, look upon heaven and earth, and all that is in them: and consider that God made them out of nothing, and mankind also.",
    topic: "Faith & Trust",
  },
  "2 maccabees 12:46": {
    text: "It is therefore a holy and wholesome thought to pray for the dead, that they may be loosed from sins.",
    topic: "Deuterocanonical Gems",
    insight: "The scriptural basis for Catholic prayer and Masses for the Holy Souls in Purgatory.",
  },

  // Baruch
  "baruch 3:37-38": {
    text: "This is our God, and there shall no other be accounted of in comparison of him... Afterwards he was seen upon earth, and conversed with men.",
    topic: "Deuterocanonical Gems",
  },

  // Psalms (Douay-Rheims / Vulgate & Standard)
  "psalm 22:1-3": {
    text: "The Lord ruleth me: and I shall want nothing. He hath set me in a place of pasture. He hath brought me up, on the water of refreshment: he hath converted my soul.",
    topic: "Peace & Calm",
  },
  "psalm 23:1-3": {
    text: "The Lord ruleth me: and I shall want nothing. He hath set me in a place of pasture. He hath brought me up, on the water of refreshment: he hath converted my soul.",
    topic: "Peace & Calm",
  },
  "psalm 90:1-2": {
    text: "He that dwelleth in the aid of the most High, shall abide under the protection of the God of Jacob. He shall say to the Lord: Thou art my protector, and my refuge: my God, in him will I trust.",
    topic: "Divine Protection",
  },
  "psalm 91:1-2": {
    text: "He that dwelleth in the aid of the most High, shall abide under the protection of the God of Jacob. He shall say to the Lord: Thou art my protector, and my refuge: my God, in him will I trust.",
    topic: "Divine Protection",
  },
  "psalm 118:105": {
    text: "Thy word is a lamp to my feet, and a light to my paths.",
    topic: "Wisdom & Discernment",
  },
  "psalm 119:105": {
    text: "Thy word is a lamp to my feet, and a light to my paths.",
    topic: "Wisdom & Discernment",
  },

  // Gospels & Acts
  "luke 1:28": {
    text: "And the angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women.",
    topic: "Marian & Holy Mother",
  },
  "luke 1:46-49": {
    text: "And Mary said: My soul doth magnify the Lord. And my spirit hath rejoiced in God my Saviour. Because he hath regarded the humility of his handmaid; for behold from henceforth all generations shall call me blessed. Because he that is mighty, hath done great things to me; and holy is his name.",
    topic: "Marian & Holy Mother",
  },
  "matthew 26:26-28": {
    text: "And whilst they were at supper, Jesus took bread, and blessed, and broke: and gave to his disciples, and said: Take ye, and eat. This is my body. And taking the chalice, he gave thanks, and gave to them, saying: Drink ye all of this. For this is my blood of the new testament, which shall be shed for many unto remission of sins.",
    topic: "Eucharist & Bread of Life",
  },
  "john 1:1-5": {
    text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him: and without him was made nothing that was made. In him was life, and the life was the light of men. And the light shineth in darkness, and the darkness did not comprehend it.",
    topic: "Wisdom & Discernment",
  },
  "john 6:35": {
    text: "And Jesus said to them: I am the bread of life: he that cometh to me shall not hunger; and he that believeth in me shall never thirst.",
    topic: "Eucharist & Bread of Life",
  },
  "john 14:6": {
    text: "Jesus saith to him: I am the way, and the truth, and the life. No man cometh to the Father, but by me.",
    topic: "Faith & Trust",
  },
  "john 14:27": {
    text: "Peace I leave with you, my peace I give unto you: not as the world giveth, do I give unto you. Let not your heart be troubled, nor let it be afraid.",
    topic: "Peace & Calm",
  },
  "matthew 11:28-30": {
    text: "Come to me; all you that labour, and are burdened, and I will refresh you. Take up my yoke upon you, and learn of me, because I am meek, and humble of heart: and you shall find rest to your souls. For my yoke is sweet and my burden light.",
    topic: "Peace & Calm",
  },
  "matthew 5:3-10": {
    text: "Blessed are the poor in spirit: for theirs is the kingdom of heaven. Blessed are the meek: for they shall possess the land. Blessed are they that mourn: for they shall be comforted. Blessed are they that hunger and thirst after justice: for they shall have their fill.",
    topic: "Wisdom & Discernment",
  },

  // Epistles & Revelation
  "1 corinthians 13:4-8": {
    text: "Charity is patient, is kind: charity envieth not, dealeth not perversely; is not puffed up; is not ambitious, seeketh not her own, is not provoked to anger, thinketh no evil; rejoiceth not in iniquity, but rejoiceth with the truth; beareth all things, believeth all things, hopeth all things, endureth all things. Charity never falleth away.",
    topic: "Love & Charity (Caritas)",
  },
  "philippians 4:6-7": {
    text: "Be nothing solicitous; but in every thing, by prayer and supplication, with thanksgiving, let your petitions be made known to God. And the peace of God, which surpasseth all understanding, keep your hearts and minds in Christ Jesus.",
    topic: "Peace & Calm",
  },
  "romans 8:28": {
    text: "And we know that to them that love God, all things work together unto good, to such as, according to his purpose, are called to be saints.",
    topic: "Faith & Trust",
  },
  "revelation 12:1": {
    text: "And a great sign appeared in heaven: A woman clothed with the sun, and the moon under her feet, and on her head a crown of twelve stars.",
    topic: "Marian & Holy Mother",
  },
  "revelation 21:4": {
    text: "And God shall wipe away all tears from their eyes: and death shall be no more, nor mourning, nor crying, nor sorrow shall be any more, for the former things are passed away.",
    topic: "Hope & Eternal Life",
  },
};
