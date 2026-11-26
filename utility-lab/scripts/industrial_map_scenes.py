"""Original 768 × 432 pixel illustrations of the classic Source and 1.6 maps."""

import math

from PIL import Image, ImageDraw


def wash(s, polygon, ink, strength):
    """Glaze all markings beneath a cast shadow while keeping their local texture."""
    box = (max(0,min(x for x,y in polygon)),max(0,min(y for x,y in polygon)),
           min(768,max(x for x,y in polygon)+1),min(432,max(y for x,y in polygon)+1))
    box = tuple(map(int,box))
    if box[2]<=box[0] or box[3]<=box[1]:
        return
    region = s.image.crop(box)
    mask = Image.new("L",region.size)
    ImageDraw.Draw(mask).polygon([(x-box[0],y-box[1]) for x,y in polygon],fill=round(255*strength))
    s.image.paste(ink,box,mask)


def chipped_edge(s, points, tint, count, step):
    for _ in range(count):
        index=s.rng.randrange(len(points)-1)
        (x,y),(xx,yy)=points[index:index+2]
        t=s.rng.random()
        px=x+(xx-x)*t;py=y+(yy-y)*t
        s.line(tint,(px,py),(px+s.rng.randrange(1,step+1),py+(1 if s.rng.random()<.5 else 0)))


class Face:
    """A plane in the illustration with local (0..1) coordinates for its texture."""
    def __init__(self, scene, corners, color=None):
        self.s = scene
        self.c = corners
        if color:
            scene.poly(color, *corners)

    def at(self, u, v):
        a, b, c, d = self.c
        return tuple(round((1-v)*((1-u)*a[i]+u*b[i])+v*((1-u)*d[i]+u*c[i])) for i in (0, 1))

    def line(self, color, *uv, width=1):
        self.s.line(color, *(self.at(*p) for p in uv), width=width)

    def area(self, color, *uv):
        self.s.poly(color, *(self.at(*p) for p in uv))

    def panel(self, left, top, right, bottom, color):
        self.area(color, (left, top), (right, top), (right, bottom), (left, bottom))

    def grain(self, count, palette, length=.025):
        for _ in range(count):
            u, v = self.s.rng.random(), self.s.rng.random()
            self.line(self.s.rng.choice(palette), (u,v), (min(1,u+length*self.s.rng.random()),v))

    def masonry(self, cols, rows, palette):
        for row in range(rows):
            y1, y2 = row/rows, (row+1)/rows
            for col in range(-1, cols):
                u1 = (col+(row%2)*.5)/cols
                lo, hi = max(0,u1), min(1,u1+1/cols)
                if lo<hi:
                    self.panel(lo, y1, max(lo,hi-.002), y2-.004, self.s.rng.choice(palette))

    def planks(self, count, colors, vertical=True):
        for i in range(count):
            q = i/count
            if vertical:
                self.line(colors[0], (q,0), (q,1))
                self.line(colors[1], (q+.003,0), (q+.003,1))
            else:
                self.line(colors[0], (0,q), (1,q))
                self.line(colors[1], (0,q+.005), (1,q+.005))


def ledge(s, points, face, top, width=5):
    s.line(face, *points, width=width)
    s.line(top, *((x,y-width//2) for x,y in points), width=2)


def billboard(s, word, x, y, k, color):
    digits = {
        '0':('111','101','101','101','111'),'1':('010','110','010','010','111'),
        '2':('111','001','111','100','111'),'3':('111','001','111','001','111'),
        '4':('101','101','111','001','001'),'5':('111','100','111','001','111'),
        '6':('111','100','111','101','111'),'7':('111','001','010','010','010'),
        '8':('111','101','111','101','111'),'9':('111','101','111','001','111'),
        'A':('010','101','111','101','101'),'B':('110','101','110','101','110'),
    }
    for i, char in enumerate(word):
        for j, row in enumerate(digits[char]):
            for n, lit in enumerate(row):
                if lit=='1':
                    s.rect(x+(4*i+n)*k, y+j*k, k, k, color)


def produce_box(s, x, y, w, h, depth, fruit=False):
    # Historical Source crates are wooden slats; the open top shows the yellow fruit.
    d=depth
    top=Face(s, [(x,y),(x+w,y+4),(x+w+d,y-7),(x+d,y-11)], "#484329")
    side=Face(s, [(x+w,y+4),(x+w+d,y-7),(x+w+d,y+h-7),(x+w,y+h+4)], "#665137")
    face=Face(s, [(x,y),(x+w,y+4),(x+w,y+h+4),(x,y+h)], "#816542")
    for part,shades in [(face,("#392f28","#b29464")),(side,("#382f28","#8b7049"))]:
        part.planks(4,shades,False)
        part.panel(0,0,.055,1,shades[1])
        part.panel(.94,0,1,1,shades[0])
        part.grain(30,shades,.22)
    if fruit:
        for j in range(4):
            for k in range(max(3,int(w/9))):
                u=(k+.45+s.rng.random()*.2)/max(3,int(w/9))
                v=(j+.45+s.rng.random()*.2)/4
                xx,yy=top.at(u,v)
                s.oval(xx-3,yy-1,8,3,s.rng.choice(("#edc338","#e4b325","#cf981d","#f2cd4e")))
                s.rect(xx+2,yy-1,2,1,"#f9d45d")
    for a,b in zip(top.c,top.c[1:]+top.c[:1]):
        s.line("#a98c58",a,b,width=2)


def inferno(Scene):
    s=Scene(200505)
    s.sky([(0,"#526b86"),(127,"#acb7ae"),(234,"#dcdbbc"),(432,"#9b8c72")])
    for x,y,w in [(49,83,115),(100,71,69),(133,77,91),(427,66,110),(463,54,63),(598,70,126)]:
        s.poly("#c6cbc1",(x,y),(x+w*.17,y-3),(x+w*.29,y-8),(x+w*.68,y-6),(x+w,y+2),(x+w*.4,y+4))
    s.hills([(0,208),(87,162),(145,181),(236,131),(312,158),(366,144),(439,171),(551,129),
             (646,149),(724,120),(768,145)],250,"#969d81")
    # Modest plaster houses above the tiled portico, seen from the B-side courtyard.
    for x,y,w,h in [(453,173,121,69),(556,147,97,92),(649,168,127,73)]:
        s.rect(x,y,w,h,"#ccb99a");s.poly("#917056",(x-5,y+2),(x+16,y-12),(x+w+5,y-3),(x+w+3,y+1))
        for q in range(x+9,x+w-7,23):
            s.rect(q,y+14,12,20,"#7a7765");s.rect(q+2,y+16,8,15,"#4d554a")
            s.rect(q+1,y+25,10,1,"#9b957c")
    for x,y,high in [(536,179,60),(617,176,46),(680,173,73)]:
        s.poly("#5e6d4e",(x-6,y),(x-8,y-24),(x-4,y-high+10),(x,y-high),(x+4,y-high+13),(x+7,y-18),(x+5,y))
    # A small shuttered outbuilding closes the far side of the paved site.
    cottage=Face(s,[(146,152),(255,165),(255,239),(147,253)],"#c3ac82")
    cottage.grain(240,("#ae9b79","#c9b38a","#b5a07a"),.045)
    tiles=Face(s,[(137,151),(259,167),(247,150),(150,136)],"#a8704d")
    tiles.planks(26,("#83543c","#ce9360"))
    ledge(s,[(138,152),(258,169)],"#625240","#b78a61",5)
    for x,y in [(172,168),(221,173)]:
        s.rect(x,y,14,21,"#7a755d");s.rect(x+2,y+2,10,16,"#4d584b")
        for xx in (x-5,x+15):
            s.rect(xx,y+1,4,18,"#65715b")
            for yy in range(y+4,y+18,4):s.rect(xx,yy,4,1,"#414f41")
        s.rect(x-1,y+21,16,2,"#8d7e61")
    s.rect(179,213,29,31,"#86775d");s.arch(182,210,24,36,"#60604d")
    # The blank, stepped stone church is characteristic of the Source courtyard.
    east=Face(s,[(397,76),(476,116),(476,249),(397,247)],"#928f7b")
    east.masonry(8,16,("#93937f","#9c9a85","#949381","#9d9c88"))
    wall=Face(s,[(255,100),(397,76),(397,247),(255,252)],"#b8b39c")
    wall.masonry(10,19,("#c5c2aa","#c3bea3","#bdbba4","#cbc6b1","#b9b9a3"))
    wall.grain(540,("#aba993","#dbd5b9","#b1b29d"),.035)
    wall.area("#a3a58d",(.9,.02),(.97,.01),(.94,.46),(.89,.65))
    ledge(s,[(251,98),(397,72),(479,113)],"#6d6f60","#cccbb8",6)
    ledge(s,[(253,108),(397,82),(476,121)],"#999b86","#d7d3b8",3)
    little=Face(s,[(398,137),(474,126),(474,244),(398,249)],"#aaa993")
    little.masonry(6,12,("#b6b49c","#b0b099","#b9b59c"))
    ledge(s,[(396,135),(474,123),(485,130)],"#838775","#cbc7ac",4)
    # Full-width brick pavers converge toward the church wall. Each row is laid
    # separately so their size, seams and colour change across the courtyard.
    s.poly("#9e9076",(0,233),(768,220),(768,432),(0,432))
    y=237
    while y<432:
        depth=max(3,int((y-210)*.078))
        width=max(10,int((y-189)*.25))
        for x in range(-width,800,width):
            xx=x+s.rng.randrange(-2,3)+(y%2)*width//2
            s.poly(s.rng.choice(("#b9a68b","#c9b599","#bbab93","#c5b296","#ab9b83")),
                  (xx,y),(xx+width-1,y),(xx+width+1,y+depth-1),(xx-2,y+depth-1))
        y+=depth
    # Source's orange tiled arcade and the shaded backs of its arches.
    arcade=Face(s,[(472,171),(768,130),(768,270),(472,245)],"#a78b67")
    arcade.masonry(20,10,("#b5a080","#bda786","#a79173","#ba9f79"))
    for x,y,w,h in [(488,180,42,59),(542,171,50,76),(606,159,61,95),(684,147,74,116)]:
        s.arch(x,y,w,h,"#615a45")
        s.arch(x+4,y+4,w-8,h-3,"#494c3e")
        s.rect(x+4,y+h-7,w-8,5,"#857d5c")
        s.line("#d3b892",(x-2,y+w*.45),(x+1,y+w*.23),(x+w*.22,y+3),(x+w*.49,y-2),
               (x+w*.76,y+3),(x+w*.97,y+w*.22),(x+w+2,y+w*.47),width=4)
    roof=Face(s,[(461,169),(766,124),(789,111),(492,148)],"#ab7150")
    roof.planks(56,("#764b3c","#ce9464"))
    ledge(s,[(459,171),(768,127)],"#70523f","#c19365",5)
    for x,y,w,h in [(641,144,75,19),(753,120,63,28),(609,145,39,12)]:
        s.foliage(x,y,w,h,("#535e3b","#65703d","#748247","#919356"),50)
    # Near left: dark timber enclosure over old rendered brick; its broken eave
    # and gutter frame the yard instead of a symmetrical generic village square.
    left=Face(s,[(0,35),(160,83),(160,295),(0,348)],"#9d7c60")
    left.masonry(8,25,("#9f7960","#9c7157","#a98568","#ac8061"))
    upper=Face(s,[(0,-12),(143,29),(143,154),(0,175)],"#5e5041")
    upper.planks(16,("#3f4037","#796454"),False)
    upper.grain(270,("#50483a","#8b715c"),.15)
    ledge(s,[(0,0),(160,45),(158,53)],"#453e34","#a07756",8)
    s.line("#585541",(154,49),(154,167),(160,175),(160,273),width=4)
    for y in (87,140,214): s.rect(152,y,7,2,"#878673")
    s.poly("#90806c",(0,343),(157,294),(253,299),(105,381),(0,392))
    # The colonnade is several feet deep. Returns, mortar, side light and
    # staggered paving remain visible inside each arched opening.
    for xx,yy,ww,hh in [(488,180,42,59),(542,171,50,76),(606,159,61,95),(684,147,74,116)]:
        s.poly("#64634e",(xx+5,yy+ww*.52),(xx+ww*.25,yy+ww*.28),(xx+ww*.25,yy+hh-8),(xx+5,yy+hh-4))
        s.poly("#5c5d49",(xx+ww*.25,yy+hh-8),(xx+ww*.77,yy+hh-13),(xx+ww-4,yy+hh-4),(xx+6,yy+hh-3))
        s.line("#817b60",(xx+ww*.25,yy+hh-8),(xx+ww*.32,yy+hh-6))
        for j in range(3):
            s.line("#8b8268",(xx+1,yy+ww*.55+10*j),(xx+5,yy+ww*.55+10*j))
    # The outer wall of the chapel is a large expanse of bleached, cracked
    # render. Broken lower corners reveal parts of the rough stone underneath.
    for base_x,base_y,scale in [(293,213,1),(339,226,.7),(371,119,.67),(418,224,.78)]:
        for _ in range(51):
            a=s.rng.random()*math.tau;r=s.rng.random()**.52
            xx=base_x+math.cos(a)*r*23*scale; yy=base_y+math.sin(a)*r*8*scale
            if s.rng.random()<.7:
                s.rect(xx,yy,s.rng.randrange(2,7),s.rng.randrange(1,3),
                       s.rng.choice(("#a3a18a","#b2ae94","#afa990","#c9c4a9")))
    s.line("#9e9f87",(354,101),(351,109),(353,118),(348,129),(348,145),(343,157))
    s.line("#abab93",(350,126),(355,132),(354,140))
    for xx in (412,431,451):
        s.rect(xx,193+(xx-412)*.32,8,16,"#838470");s.rect(xx+1,194+(xx-412)*.32,6,13,"#707461")
    wash(s,[(0,236),(154,224),(321,295),(287,308),(0,396)],"#403a34",.26)
    wash(s,[(405,90),(473,121),(473,220),(426,204)],"#646850",.22)
    wash(s,[(461,178),(768,134),(768,144),(480,191)],"#5a5140",.22)
    # Small crenellations of ochre and brown resolve the tile ends at full resolution.
    for xx in range(463,769,5):
        yy=170-(xx-460)*.14
        s.rect(xx,yy,2,2,"#6e4938");s.rect(xx+1,yy-2,3,1,"#d7a474")
    wash(s,[(304,300),(340,279),(477,276),(552,301),(617,339),(604,354),(459,369),(329,345)],"#4e4b38",.27)
    # Traditional octagonal fountain with a low stone basin and water lilies.
    rim=[(301,298),(343,273),(451,266),(535,281),(559,303),(520,328),(402,341),(322,324)]
    center=(425,301)
    lower=[(x,y+17) for x,y in rim]
    for i in range(8):
        j=(i+1)%8
        s.poly(("#b5ad8a","#a99e7c","#9e9578","#9a9277","#ac9e80","#baaa8a","#bfb291","#aea282")[i],
               rim[i],rim[j],lower[j],lower[i])
    s.poly("#d8cfab",*rim)
    water=[(round(center[0]+(x-center[0])*.86), round(center[1]+(y-center[1])*.77)) for x,y in rim]
    s.poly("#59674d",*water)
    for i in range(80):
        x=s.rng.randint(338,514); y=s.rng.randint(285,314)
        if ((x-427)/89)**2+((y-300)/20)**2>1: continue
        s.line(s.rng.choice(("#778969","#97a17b","#849374")),(x,y),(x+s.rng.randint(2,10),y))
        if i%4==0:s.oval(x,y-1,5,2,"#a4a15a")
    for index in (0,3,4,5,6):
        a,b=rim[index],rim[(index+1)%8]
        mx,my=(a[0]+b[0])/2,(a[1]+b[1])/2
        s.line("#938a6e",(mx,my+2),(mx+1,my+15))
        s.line("#cfc5a2",(mx+2,my+3),(mx+3,my+13))
    chipped_edge(s,rim+[rim[0]],"#e4d4ae",80,4)
    s.oval(404,283,57,12,"#8a8162");s.poly("#a49c7d",(416,281),(421,266),(445,266),(452,282))
    s.oval(391,253,85,25,"#9b9777");s.oval(390,249,87,20,"#c0bba0");s.oval(397,250,72,11,"#6d7353")
    s.foliage(432,250,69,15,("#5d7145","#748347","#8a9053","#a19d62"),45)
    for _ in range(37):
        x=s.rng.randrange(407,463);y=s.rng.randrange(244,252)
        s.line("#899659",(x,y),(x+s.rng.randrange(-3,4),y-3))
    for xx in (404,415,452,458):
        s.line("#839357",(xx,251),(xx-2,258),(xx+1,265))
        s.rect(xx-2,261,4,2,"#a2a168")
    for x,h in [(413,10),(438,16),(451,8)]:s.line("#687b43",(x,254),(x-5,252+h),width=2)
    # Stacks of fruit crates and tied dark barrels round out the original B site.
    for x,y,r in [(260,238,10),(277,239,10),(271,225,9)]:
        s.rect(x-r,y,r*2,18,"#514e3d");s.oval(x-r,y-3,r*2,6,"#74705a")
        for yy in (y+4,y+13): s.rect(x-r,yy,r*2,2,"#88836c")
    for xx,yy,ww,hh,dd in [(49,275,76,42,26),(53,241,72,35,24),(114,300,78,42,27),(116,266,72,35,25),
                              (15,344,93,55,34),(38,306,84,45,30),(117,334,71,39,28)]:
        wash(s,[(xx,yy+hh-1),(xx+ww+dd,yy+hh-9),(xx+ww+dd+18,yy+hh+3),
                (xx+ww-5,yy+hh+13),(xx+8,yy+hh+4)],"#474532",.35)
        produce_box(s,xx,yy,ww,hh,dd,True)
    for pts in [[(648,330),(632,335),(628,340),(609,341)],[(255,392),(268,388),(273,384),(291,380)]]:
        s.line("#9e947c",*pts)
    # Overhead ivy grows from the near eave; narrow sunlit leaves catch its edge.
    s.foliage(69,25,171,62,("#344b36","#485d3e","#627648","#889355"),100)
    for x,y in [(31,43),(46,40),(82,42),(124,33)]:
        s.line("#5d6841",(x,y),(x-2,y+8),(x+1,y+14))
        s.oval(x-2,y+8,5,3,"#74814b")
    s.wire((0,16),(310,72),17,"#635e50")
    s.wire((310,72),(707,51),16,"#6e7061")
    return s.image


def yard_crate(s,x,y,w,h,d):
    top=Face(s,[(x,y),(x+d,y-14),(x+w+d,y-11),(x+w,y+3)],"#b09b74")
    left=Face(s,[(x,y),(x+w,y+3),(x+w,y+h+3),(x,y+h)],"#947956")
    right=Face(s,[(x+w,y+3),(x+w+d,y-11),(x+w+d,y+h-11),(x+w,y+h+3)],"#776349")
    for face,light,dark in [(left,"#b29971","#64523e"),(right,"#8f7957","#574c3d")]:
        face.planks(max(3,w//12),(dark,light))
        face.grain(int(w*h/35),(dark,light),.09)
        for lo,hi in [(0,.07),(.91,1)]:face.panel(lo,0,hi,1,light)
        face.panel(0,0,1,.065,light);face.panel(0,.93,1,1,dark)
        for u in (.04,.94):
            for v in (.06,.94):s.rect(*face.at(u,v),2,2,dark)
    top.planks(7,("#8c7759","#bfa781"))


def cylinder(s,cx,top,width,height,colors):
    dark,shade,body,bright,edge=colors
    half=width//2
    for i in range(width):
        # Banded ink follows the round tank and gives the sun a broad, soft shoulder.
        t=i/width
        color=dark if t<.035 else shade if t<.14 else body if t<.28 else bright if t<.65 else body if t<.84 else shade
        lo=top+round(8*(2*t-1)**2)
        s.rect(cx-half+i,lo,1,height-(lo-top)+round(8*math.sin(math.pi*t)),color)
    s.oval(cx-half,top-1,width,18,edge)
    s.oval(cx-half+2,top,width-4,13,bright)
    for y in (top+height*.28,top+height*.67,top+height-3):
        s.line(shade, *((cx-half+i*width/16,round(y+6*math.sin(math.pi*i/16))) for i in range(17)))
    for i in range(int(width*5)):
        x=s.rng.randrange(cx-half+2,cx+half-2);y=s.rng.randrange(top+17,top+height-4)
        if x>cx+width*.32 or x<cx-width*.25:continue
        s.rect(x,y,1,s.rng.randrange(1,5),s.rng.choice((bright,body,body)))


def nuke(Scene):
    s=Scene(200511)
    s.sky([(0,"#657479"),(100,"#9fa39a"),(201,"#c6c4ac"),(274,"#b7ad92"),(432,"#817d70")])
    for x,y,scale in [(-37,66,1.35),(155,46,1.29),(291,97,.65),(520,64,1.55),(677,44,1.31)]:
        for q,col in enumerate(("#acafa6","#b3b6ab","#bec1b3")):
            x+=s.rng.randrange(-4,8); y-=2
            ridge=[(0,7)]
            for dx in range(5,172,5):
                rise=math.sin(dx/172*math.pi)*s.rng.randrange(5,11)
                ridge.append((dx,4-rise-q))
            ridge.extend([(176,8),(147,10),(66,12)])
            s.poly(col,*((x+a*scale,y+b*scale) for a,b in ridge))
    s.hills([(0,172),(58,144),(122,153),(189,134),(249,147),(297,121),(348,156),
             (407,142),(466,153),(531,118),(587,132),(627,110),(707,145),(768,127)],220,"#8f998e")
    s.hills([(0,186),(77,159),(148,181),(198,163),(289,177),(332,155),(407,173),
             (473,160),(534,179),(610,146),(678,166),(768,143)],222,"#78867e")
    # Roof exhaust behind the old turbine hall. This view faces the building,
    # looking past its yellow yard tank, not toward the modern plant skyline.
    for xx,yy,r in [(315,145,26),(364,157,23)]:
        cylinder(s,xx,yy,r*2,50,("#747974","#aaa99a","#b8b6a7","#c7c4b2","#939788"))
        s.poly("#aaa99c",(xx-r,yy+4),(xx-r*.7,yy-8),(xx+r*.48,yy-10),(xx+r,yy+4))
        s.line("#d0cdb9",(xx-r*.7,yy-8),(xx+r*.48,yy-10))
    hall=Face(s,[(259,163),(481,158),(481,248),(259,244)],"#b1b0a0")
    hall.masonry(19,9,("#b1b2a3","#babab0","#b4b4a5","#b9b9aa"))
    portion=Face(s,[(481,158),(635,180),(635,265),(481,248)],"#898e85")
    portion.planks(22,("#777e77","#a2a398"))
    top=Face(s,[(246,160),(467,146),(492,154),(264,166)],"#929488")
    top.planks(40,("#7c817a","#a6aa9d"))
    ledge(s,[(252,163),(481,155),(637,178)],"#656f69","#c6c5b1",5)
    for k in range(11):
        x=278+k*17;y=177-k*.13
        s.rect(x,y,14,8,"#686f65");s.rect(x+1,y+1,11,3,"#8f988b")
    s.rect(331,208,72,42,"#68726c");s.rect(336,212,62,33,"#444e48");s.rect(340,223,27,21,"#8d8773")
    # Pitched garage roof terminating above a deep square loading door.
    shed=Face(s,[(523,157),(687,124),(687,259),(523,247)],"#969484")
    shed.planks(32,("#838477","#a9a796"))
    s.poly("#7e8175",(516,157),(590,99),(706,116),(687,125),(525,161))
    roof=Face(s,[(516,157),(590,100),(706,116),(687,125)],"#999b8d")
    roof.planks(19,("#7f8378","#b5b3a0"))
    ledge(s,[(516,158),(685,121),(710,125)],"#5a6863","#c1c0a8",5)
    door=Face(s,[(551,182),(637,166),(637,252),(551,245)],"#484e46")
    door.panel(.05,.055,.94,.95,"#60665a");door.panel(.1,.1,.91,.87,"#3c4843")
    door.panel(.38,.1,.9,.41,"#575d50")
    for u in (.08,.92):door.panel(u,0,u+.02,1,"#b8ad7b")
    for i in range(4):
        s.rect(650+i*8,147-i*1.4,6,9,"#626d63")
    s.poly("#817f70",(0,275),(304,237),(500,240),(768,266),(768,432),(0,432))
    ground=Face(s,[(0,263),(768,240),(768,432),(0,432)],"#999488")
    ground.grain(5600,("#87867d","#aaa498","#99988b","#a9a393","#918d80"),.006)
    for pts in [[(0,384),(88,363),(126,366),(141,353),(218,340)],[(421,257),(445,278),(457,280),(488,302),(494,324),(563,361)],
                [(674,273),(631,308),(645,325),(613,339)],[(174,418),(229,393),(269,388)]]:
        s.line("#7d8077",*pts)
    s.poly("#788078",(0,290),(181,232),(346,240),(157,332),(0,361))
    # Yellow sheet-steel silo and its safety rail are the silhouette from the old yard.
    cylinder(s,89,53,148,220,("#746843","#a38a53","#ba9e5b","#d2b969","#b1a268"))
    s.oval(15,50,147,19,"#bca75e")
    for xx in (20,44,78,110,142,159):
        yy=48+int(math.sin((xx-15)/147*math.pi)*5)
        s.rect(xx,yy-12,2,17,"#6b6c52")
    s.line("#8d8b61",(19,40),(48,36),(87,35),(124,37),(158,43),width=2)
    s.line("#b5ab67",(19,39),(48,35),(87,34),(124,36),(158,42))
    for yy in (86,94,102,110,118,126,134,142,150,158,166,174,182,190,198,206,214,222,230):
        s.rect(131,yy,8,1,"#8b8055")
    s.line("#746e4d",(131,78),(131,244));s.line("#8d8254",(139,77),(139,245))
    for u in (38,84,121):
        s.line("#a28d52",(u,67),(u,248))
        for yy in range(77,250,13):s.rect(u-1,yy,3,1,"#c4ad65")
    for xx,yy in [(52,122),(98,147),(113,88),(111,207),(77,232),(92,106),(125,174)]:
        for j in range(11):
            s.rect(xx+s.rng.randrange(-5,6),yy+s.rng.randrange(-2,3),1,s.rng.randrange(2,9),"#aa965b")
    s.rect(102,180,15,11,"#b1a76b");s.rect(103,181,13,9,"#d5cda1")
    s.poly("#555a49",(105,188),(109,182),(113,188))
    s.rect(109,184,1,2,"#e0c75b")
    # Blue-black parent shed sits behind the tank and above the wooden stacks.
    rear=Face(s,[(162,126),(224,148),(224,244),(162,263)],"#787c70")
    rear.planks(13,("#6f7367","#98998a"))
    ledge(s,[(163,124),(227,148)],"#555d55","#acaa92",4)
    # Ribbed red freight container at the far end, including its paired locking rods.
    long=Face(s,[(447,195),(530,183),(530,244),(447,249)],"#9c665a")
    long.planks(18,("#80554d","#b27e6c"));long.grain(85,("#a47161","#85584e"))
    end=Face(s,[(530,183),(562,189),(562,245),(530,244)],"#82574c")
    for u in (.11,.43,.57,.89):
        end.line("#b9a485",(u,.09),(u,.93),width=2)
    end.line("#644d45",(.5,.04),(.5,.98));end.line("#b4a086",(.62,.7),(.86,.7))
    long.panel(.07,.32,.26,.44,"#977068")
    for yy,uu in [(.34,.19),(.38,.22),(.405,.15)]:long.line("#c9b59c",(.09,yy),(uu,yy))
    for xx,yy in [(275,152),(301,151),(472,149)]:
        s.line("#67706a",(xx,yy),(xx,yy-8),(xx+7,yy-12),(xx+17,yy-12),width=3)
        s.line("#aeaea0",(xx,yy-8),(xx+7,yy-13),(xx+17,yy-13))
    s.line("#595f56",(333,207),(333,203),(404,203),(404,215),width=2)
    for xx in (322,410):
        s.rect(xx,207,6,4,"#52594f");s.rect(xx+1,208,4,1,"#cec7a4")
    s.rect(312,224,8,5,"#907956");s.rect(313,225,6,1,"#cbb182")
    wash(s,[(262,165),(482,157),(481,168),(274,176)],"#4e5850",.26)
    wash(s,[(525,161),(682,126),(681,140),(536,173)],"#485348",.3)
    wash(s,[(447,248),(562,243),(594,247),(476,259)],"#4c5148",.44)
    for xx,yy,w,h,d in [(232,216,39,39,12),(269,225,25,27,12),(177,194,47,48,16),(180,242,55,40,19)]:
        wash(s,[(xx,yy+h),(xx+w+d,yy+h-10),(xx+w+d+27,yy+h-6),(xx+w+9,yy+h+8)],"#41493f",.47)
        yard_crate(s,xx,yy,w,h,d)
    # One close timber case anchors the edge and sets scale against the small distant door.
    yard_crate(s,-51,143,107,139,32)
    s.rect(8,223,17,9,"#c1bea1");s.rect(10,225,9,1,"#6d705d");s.rect(9,228,13,1,"#8a8970")
    # Chain-link fence is a narrow receding strip, with genuine diamond mesh.
    fence=Face(s,[(593,174),(768,38),(768,429),(593,255)])
    for i in range(-22,43):
        for sign in (1,-1):
            # Clip each wire in the local fence plane at its four edges.
            t=i/17; slope=sign*1.37
            v0=max(0,min(1,(-t)/slope));v1=max(0,min(1,(1-t)/slope))
            if abs(v1-v0)<.0001:continue
            fence.line("#72776b",(t+slope*v0,v0),(t+slope*v1,v1))
    for u in (0,.19,.44,.76,.99):
        fence.line("#675f4f",(u,0),(u,1),width=3);fence.line("#aba38c",(u+.006,.014),(u+.006,1))
    fence.line("#5b6258",(0,0),(1,0),width=3)
    s.wire((585,164),(768,17),6,"#5c645a")
    # A drainage channel close to camera, with the iron grating inset into the
    # asphalt. Rust and the surrounding scratches follow the surface plane.
    drain=Face(s,[(-13,399),(166,340),(188,344),(4,414)],"#67685d")
    drain.panel(.02,.21,.99,.82,"#484d45")
    for u in range(1,33):
        drain.line("#878475",(u/34,.17),(u/34,.82),width=2)
    drain.line("#b1a68d",(0,.91),(1,.89))
    for x,y in [(41,383),(72,385),(145,365),(520,304),(608,286)]:
        for _ in range(11):
            dx,dy=s.rng.randrange(-7,8),s.rng.randrange(-3,4)
            s.rect(x+dx,y+dy,s.rng.randrange(1,4),1,"#7b7865")
    for x,y in [(226,311),(230,310),(613,339),(144,352)]:
        s.line("#79795e",(x,y),(x-2,y-4));s.line("#858462",(x+1,y),(x+3,y-3))
    s.birds([(306,91,1),(319,87,1),(324,92,1)],"#81877e")
    return s.image


def boxcar(s, near_left, near_right, far_left, top, floor, vanishing, palette, length=.68):
    # The camera sees the end and one long side. Every steel rib goes to the
    # same vanishing point as the rails. In 1.6 the ladders sit on the ends.
    dark, iron, steel, worn, edge, rooflight = palette
    vx,vy=vanishing
    def far(p):return (p[0]+(vx-p[0])*length,p[1]+(vy-p[1])*length)
    left=(near_left,top);right=(near_right,top-2)
    # The two axles, bearing carriers and steel center sill can be glimpsed
    # under the deep box body. A grounding shadow holds them to their track.
    foundation=[(near_left-2,floor+10),(near_right+8,floor+12),far((near_right+5,floor+12)),far((near_left-4,floor+9))]
    wash(s,foundation,"#303529",.56)
    s.poly(dark,(near_left+9,floor-2),(near_right-6,floor-2),(near_right-11,floor+7),(near_left+14,floor+9))
    for xx in (near_left+16,near_right-24):
        s.oval(xx-5,floor-4,11,17,"#34372d")
        s.rect(xx-3,floor-1,8,6,"#494a3b")
    end=Face(s,[left,right,(near_right,floor),(near_left,floor+2)],steel)
    edge_x=near_right if far_left else near_left
    side=Face(s,[(edge_x,top-2),far((edge_x,top-2)),far((edge_x,floor)),(edge_x,floor)],iron)
    side.grain(450,(steel,iron,worn),.035)
    for u in (0,.13,.27,.35,.49,.62,.76,.9,.99):
        side.panel(u,.018,min(1,u+.011),.98,dark)
        side.line(edge,(u,.02),(u,.96))
    side.panel(.33,.09,.62,.84,steel)
    for u in (.33,.41,.52,.62):side.line(iron,(u,.08),(u,.86))
    for v in (.07,.82,.89,.96):side.line(dark,(0,v),(1,v),width=2)
    side.line(worn,(.34,.12),(.62,.12));side.line(iron,(.54,.38),(.54,.6),width=2)
    for u in (.10,.26,.76,.91):
        px,py=side.at(u,1)
        scale=1-u*.75
        s.oval(px-8*scale,py-2*scale,14*scale,16*scale,"#38382c")
        s.oval(px-5*scale,py+1*scale,8*scale,9*scale,"#535244")
    for u in (.10,.76):
        xx,yy=side.at(u,1); uu,vv=side.at(min(.99,u+.16),1)
        s.line("#484838",(xx,yy+3),(uu,vv+3),width=4)
        s.line("#6b6953",(xx+1,yy+3),(uu-1,vv+3))
    roof=Face(s,[left,right,far(right),far(left)],worn)
    roof.planks(15,(iron,rooflight),False)
    end.grain(210,(iron,worn,steel),.06)
    for u in (.03,.96):
        end.panel(u,0,u+.025,1,dark);end.line(edge,(u,0),(u,.99))
    for v in (.04,.16,.28,.40,.52,.64,.76,.88,.95):
        end.panel(.03,v,.97,v+.024,iron)
        end.line(worn,(.05,v+.026),(.94,v+.026))
        for u in (.05,.22,.64,.95):
            xx,yy=end.at(u,v);s.rect(xx,yy,2,2,dark);s.rect(xx,yy,1,1,edge)
    end.grain(150,(steel,worn,iron),.026)
    lx=.74
    for u in (lx,lx+.14):end.line(dark,(u,-.04),(u,.96),width=3)
    for i in range(11):
        v=.006+i*.087
        end.line(dark,(lx,v+.012),(lx+.14,v+.012),width=2)
        end.line(edge,(lx,v),(lx+.14,v),width=2)
    end.line(dark,(.02,.96),(.98,.96),width=5)
    cx=(near_left+near_right)/2
    s.rect(cx-5,floor,10,8,"#484638");s.rect(cx-9,floor+6,18,4,"#2e3028")
    for u in (.18,.83):
        x,y=end.at(u,1)
        s.rect(x-4,y,8,6,"#4b493b")
    return end,side


def train(Scene):
    s=Scene(1606)
    s.sky([(0,"#647d93"),(132,"#b5c3c5"),(217,"#d3ceaa"),(432,"#877b62")])
    for x,y,w in [(376,38,81),(429,26,110),(484,71,92),(348,87,107),(541,39,96)]:
        s.poly("#d2d4c8",(x,y),(x+w*.18,y-3),(x+w*.26,y-7),(x+w*.54,y-6),(x+w*.67,y-9),(x+w*.83,y-3),(x+w,y+2),(x+w*.4,y+3))
    # The GoldSrc yard is split by a long slot open to the sky. Two heavy
    # concrete roof decks and square pillared colonnades frame the tracks.
    s.poly("#4b5040",(0,0),(405,0),(414,40),(390,139),(367,183),(0,163))
    soffit=Face(s,[(0,14),(416,56),(366,175),(0,134)],"#646652")
    soffit.planks(14,("#545b4a","#71705b"));soffit.grain(880,("#73705c","#5c614f","#6a6c56"),.023)
    for i in range(7):
        u=i/7
        soffit.line("#515847",(u,0),(u,1),width=3)
    ledge(s,[(413,-6),(418,51),(370,177)],"#454e42","#92927b",6)
    s.poly("#636752",(602,0),(768,0),(768,166),(463,183),(470,144))
    right=Face(s,[(625,0),(768,0),(768,136),(467,178)],"#686b55")
    right.planks(12,("#585d4a","#717661"),False);right.grain(650,("#727761","#626652"),.02)
    ledge(s,[(602,-3),(468,145),(455,181)],"#484f40","#999a80",5)
    # A landscape of windows, brick arches and gates at the far end.
    back=Face(s,[(317,144),(492,139),(493,229),(317,230)],"#81745b")
    back.masonry(16,13,("#8a7960","#85765c","#807259","#8f7e64"))
    for xx in (326,362,437,474):
        s.rect(xx,159,14,22,"#575c49");s.rect(xx+1,160,12,3,"#a8aa8b")
        s.rect(xx+7,159,1,21,"#817c64")
    s.rect(398,184,32,47,"#535544");s.rect(401,186,27,40,"#454c3d")
    s.rect(375,174,45,8,"#995d49");s.rect(379,176,25,1,"#c6b794");s.rect(379,179,35,1,"#afaa8b")
    sidewall=Face(s,[(0,103),(355,166),(355,235),(0,317)],"#89836a")
    sidewall.masonry(28,11,("#888369","#8f896f","#959074","#8c886d"))
    sidewall.panel(0,.68,1,.95,"#72745c")
    sidewall.grain(1900,("#76765e","#969174","#817f65"),.021)
    for u in (.11,.25,.4,.56,.7,.83):
        sidewall.panel(u,.22,u+.09,.52,"#545e49");sidewall.panel(u+.009,.25,u+.079,.48,"#747d63")
    farwall=Face(s,[(472,172),(768,102),(768,307),(472,229)],"#7d8067")
    farwall.planks(19,("#72765d","#8d8d73"),False)
    s.poly("#8a8570",(0,290),(349,216),(479,217),(768,282),(768,432),(0,432))
    ground=Face(s,[(0,287),(768,257),(768,432),(0,432)],"#87836e")
    ground.grain(9200,("#6b6e59","#9e9a7f","#a7a087","#797963","#92917a"),.003)
    # Steel rails and ties physically converge at the central vanishing point.
    vp=(409,193)
    for xl,xr in [(-385,8),(117,319),(441,628),(770,995)]:
        def proj(x,t):return(vp[0]+(x-vp[0])*t,vp[1]+(444-vp[1])*t)
        for step in range(2,27):
            t=(step/24)**1.76
            if t<.082:continue
            a,b,c,d=proj(xl-20,t),proj(xr+20,t),proj(xr+20,t+.014*t),proj(xl-20,t+.014*t)
            s.poly("#655d4c",a,b,c,d)
            s.line("#91846b",a,b)
            if t>.45:
                for pair in (xl,xr):
                    xx,yy=proj(pair,t)
                    s.rect(xx-4*t,yy,8*t,1.8*t,"#444a3a")
        for xx in (xl,xr):
            s.poly("#5b5d4c",proj(xx-1,.1),proj(xx+1,.1),proj(xx+4,1),proj(xx-3,1))
            s.line("#b2b19b",proj(xx,.1),proj(xx,1),width=2)
    for start,end in [((61,3),(301,138)),((718,0),(491,150))]:
        s.line("#565d4a",start,end,width=6);s.line("#7e8066",(start[0],start[1]+3),(end[0],end[1]+3),width=2)
    for k in range(3):
        s.line("#515746",(14,94+k*4),(346,167+k),width=2)
    for xx,y0,w,h in [(355,150,10,76),(459,138,11,85),(289,113,18,127),(536,98,23,145),(142,56,29,199),(649,48,31,217)]:
        wash(s,[(xx-2,y0+h-3),(xx+w,y0+h-2),(xx+w*2.8,y0+h+8),(xx+w*.9,y0+h+10)],"#454a38",.30)
        s.rect(xx,y0,w,h,"#4f533e");s.rect(xx+2,y0,w*.40,h,"#67674c")
        s.rect(xx-3,y0+h-7,w+6,8,"#575b45");s.rect(xx-4,y0+h-1,w+8,3,"#73735b")
        s.rect(xx-4,y0-2,w+8,5,"#77735a")
    s.poly("#666a55",(20,287),(75,268),(338,220),(322,237),(125,314))
    s.poly("#71715b",(486,228),(602,231),(768,261),(768,352),(684,325))
    boxcar(s,138,202,True,165,236,vp,("#494f3d","#71775d","#899071","#9c9d7d","#b0b191","#bab79c"),.67)
    boxcar(s,509,569,False,174,237,vp,("#4c503e","#6c7160","#89917a","#a4a18a","#b3ae91","#bcbc9e"),.66)
    # Original bomb train: a low flatcar carries a compact yellow-and-black
    # radiation-marked payload between the taller boxcars.
    flat=Face(s,[(420,241),(453,246),(492,282),(433,277)],"#7d755b")
    flat.planks(13,("#5c5d49","#a09470"),False)
    s.poly("#45493a",(433,277),(492,282),(490,290),(433,285))
    crate=Face(s,[(432,237),(458,241),(458,265),(432,262)],"#3d4637")
    s.poly("#6f7150",(432,237),(441,232),(466,237),(458,241))
    s.poly("#545a40",(458,241),(466,237),(466,260),(458,265))
    crate.line("#ccbf5b",(0,.06),(1,.06),(1,.96),(0,.96),(0,.06),width=2)
    cx,cy=445,250;s.oval(cx-2,cy-2,5,5,"#d8c65d")
    for i in range(3):
        a=math.radians(-90+i*120)
        s.poly("#d6c557",(cx+math.cos(a-.31)*3,cy+math.sin(a-.31)*3),
               (cx+math.cos(a-.42)*8,cy+math.sin(a-.42)*8),
               (cx+math.cos(a+.42)*8,cy+math.sin(a+.42)*8),(cx+math.cos(a+.31)*3,cy+math.sin(a+.31)*3))
    # Foreground end ladder silhouetted against a sage-green freight car.
    end,side=boxcar(s,28,189,True,164,316,vp,("#404635","#677259","#859072","#9fa184","#a8aa8a","#bab79b"),.72)
    # A brake wheel, walker platform, cut lever and locking-pin assembly on the end.
    cx,cy=68,260
    s.line("#4a4e39",(cx,cy+4),(cx-6,292),(cx-15,297),width=2)
    s.draw.ellipse((cx-9,cy-9,cx+9,cy+9),outline="#48513f",width=3)
    s.draw.ellipse((cx-9,cy-9,cx+9,cy+9),outline="#72785c",width=1)
    for i in range(5):
        a=i*math.tau/5
        s.line("#545b43",(cx,cy),(cx+8*math.cos(a),cy+8*math.sin(a)))
    s.rect(cx-2,cy-2,4,4,"#4b533d")
    s.line("#5c6049",(39,302),(48,306),(112,306),(122,301),width=2)
    end.panel(.16,.46,.37,.57,"#7b8062");end.line("#c7bea0",(.18,.49),(.34,.49))
    end.line("#a6a186",(.18,.52),(.29,.52))
    rust_end,rust_side=boxcar(s,613,815,False,155,342,vp,("#55473b","#7f6452","#9d7961","#b49379","#c1a78b","#c1ad94"),.77)
    for u in (.13,.15,.49,.85):
        for _ in range(9):
            k=u+s.rng.random()*.028;v=s.rng.random()*.74+.07
            rust_end.line("#8c674f",(k,v),(k+.002,min(.93,v+.11)))
    billboard(s,"35",636,244,2,"#c4ae8a")
    s.rect(631,264,28,2,"#bda587");s.rect(632,269,16,1,"#bc9d7e")
    for x,y in [(651,189),(677,296),(704,242)]:
        s.line("#b99575",(x,y),(x+4,y+2),(x+15,y));s.line("#775b49",(x,y+2),(x+8,y+2))
    # The heavy slabs throw a raking shadow over the car ends; the sliver of
    # uncovered sky illuminates the center between the two darker galleries.
    wash(s,[(0,0),(118,0),(188,168),(188,196),(140,231),(0,262)],"#344034",.16)
    wash(s,[(768,54),(768,259),(613,287),(600,251)],"#4e4a3c",.22)
    # Walkway edge and painted concrete batch lines in the near left corner.
    f=Face(s,[(0,315),(59,303),(64,433),(0,433)],"#817d69");f.grain(280,("#706e5d","#99957a"))
    s.line("#a4a28a",(0,316),(59,303),(65,432),width=2)
    for _ in range(550):
        x=s.rng.randrange(70,768);y=s.rng.randrange(352,432)
        k=s.rng.randrange(2,5)
        s.poly(s.rng.choice(("#76735f","#a29c81","#777561","#8e8973")),(x,y),(x+1,y-1),(x+k,y),(x+2,y+1))
    return s.image


def winter_tree(s, x, y, h, girth, dark, side):
    # Taper every fork, placing long lateral branches on alternately exposed sides.
    def limb(base,length,angle,width,generation):
        bend=s.rng.uniform(-.22,.22)
        mid=(base[0]+math.sin(angle)*length*.51,base[1]-math.cos(angle)*length*.51)
        tip=(mid[0]+math.sin(angle+bend)*length*.49,mid[1]-math.cos(angle+bend)*length*.49)
        s.line(dark,base,mid,tip,width=max(1,round(width)))
        if width>2:s.line(side,(base[0]-1,base[1]),(mid[0]-1,mid[1]),(tip[0]-1,tip[1]),width=max(1,int(width/4)))
        if generation>=5 or length<5:return
        side_angle=s.rng.uniform(.4,.88)*(-1 if s.rng.randrange(2) else 1)
        limb(tip,length*s.rng.uniform(.63,.77),angle+bend-side_angle*.35,width*.62,generation+1)
        limb(mid if generation==0 else tip,length*s.rng.uniform(.53,.72),angle+bend+side_angle,width*.52,generation+1)
        if generation in (1,2):
            limb(mid,length*.50,angle+bend-side_angle*.95,width*.49,generation+1)
    limb((x,y),h*.36,-.06,girth,0)


def office(Scene):
    s=Scene(200410)
    s.sky([(0,"#8296a5"),(104,"#b9c6cc"),(207,"#d6dbdc"),(310,"#c3d0d3"),(432,"#b7c9d0")])
    for x,y,w in [(0,56,126),(142,62,237),(376,46,158),(439,77,201),(619,38,149)]:
        s.poly("#c3ccd0",(x,y),(x+.18*w,y-5),(x+.36*w,y-9),(x+.57*w,y-5),(x+.79*w,y-8),(x+w,y+3),(x+w*.4,y+5))
    # Tall office blocks from the original snowy skybox, softened by winter haze.
    for x,y,w,h in [(177,68,56,104),(236,52,47,117),(321,97,43,77),(397,61,50,117),(462,13,72,158),(546,45,43,126),(617,85,55,91)]:
        s.rect(x,y,w,h,"#98a7ad");s.rect(x+w*.72,y,w*.28,h,"#899da5")
        s.rect(x+4,y-4,w-7,5,"#a4b0b3")
        for j in range(y+7,y+h-4,9):
            for i in range(x+4,x+w-3,7):
                s.rect(i,j,3,4,"#cbd1cd" if s.rng.random()<.49 else "#a6b4b9")
    for xx,yy,hh in [(158,171,125),(367,167,116),(565,163,107)]:
        winter_tree(s,xx,yy,hh,3,"#8a999c","#a1aeae")
    # Red-brown brick surrounds a grey stone entrance and the painted garage fascia.
    left=Face(s,[(0,85),(199,136),(199,265),(0,330)],"#83746e")
    left.masonry(18,17,("#866e63","#886e63","#94796a","#8d7568","#796961","#8b7267"))
    upper=Face(s,[(0,84),(199,134),(199,163),(0,141)],"#665b53")
    upper.planks(14,("#5b514a","#9d7967"))
    ledge(s,[(0,81),(199,130),(216,127)],"#404d51","#dde0d6",6)
    shutter=Face(s,[(0,157),(146,172),(146,265),(0,310)],"#798789")
    shutter.planks(33,("#536268","#9aa6a5"),False)
    shutter.grain(350,("#8e9b9b","#667478"),.10)
    surround=Face(s,[(0,123),(151,147),(151,170),(0,154)],"#718580")
    surround.grain(520,("#555e59","#677069","#8d8a77","#9a8e76","#715f51"),.05)
    for u in (.05,.20,.55,.68,.80):
        for i in range(6):
            uu=u+s.rng.random()*.045
            surround.line("#6d6355",(uu,.1),(uu,.33+s.rng.random()*.64))
    ledge(s,[(0,155),(146,171),(146,267)],"#404f55","#9baba9",4)
    for x in range(3,141,9):
        yy=155+x*.105; hh=s.rng.randint(1,9)
        s.poly("#dbe1dc",(x,yy),(x+2,yy),(x+1,yy+hh))
    left.panel(.84,.42,.97,.85,"#62554e");left.panel(.85,.44,.958,.81,"#6c645c")
    # Central masonry entry sticks forward in two stages, with the unmistakable
    # building number on the stone band directly over its recessed portal.
    wing=Face(s,[(199,130),(275,100),(276,255),(199,268)],"#819096")
    wing.masonry(7,14,("#849496","#8e9c9d","#829296","#8d9b9f"))
    port=Face(s,[(275,101),(408,136),(408,241),(275,255)],"#91a1a4")
    port.masonry(11,12,("#98a6a6","#9faaa8","#98a4a3","#919e9f"))
    ledge(s,[(195,130),(274,97),(413,133)],"#49595d","#dbe0d6",8)
    ledge(s,[(195,138),(274,106),(408,141)],"#667378","#9ba7a7",4)
    for fraction in (.71,.76):
        wing.line("#65767c",(0,fraction),(1,fraction),width=2)
        port.line("#65767c",(0,fraction),(1,fraction),width=2)
    portal=Face(s,[(302,163),(380,173),(380,235),(302,245)],"#616e71")
    portal.panel(.07,.06,.93,.98,"#4e5d60");portal.panel(.14,.10,.87,.99,"#425359")
    portal.panel(.21,.13,.78,.90,"#667574");portal.panel(.25,.19,.74,.68,"#839193")
    portal.line("#495b60",(.52,.19),(.52,.95),width=2)
    portal.line("#9baaa6",(.57,.7),(.67,.7))
    ledge(s,[(290,155),(375,166),(391,164)],"#526268","#a7b3ae",6)
    # Individually shaped metal numerals are part of the building, not a UI label.
    billboard(s,"52375",321,145,1.6,"#485b60")
    for i in range(4):
        s.poly("#839093",(297-i*5,243+i*3),(381+i*5,235+i*3),
               (387+i*5,239+i*3),(291-i*5,247+i*3))
        s.line("#c1cac6",(292-i*5,246+i*3),(386+i*5,238+i*3))
    # The glazed connector behind the yard reveals the familiar fluorescent corridor.
    connector=Face(s,[(407,147),(627,114),(627,250),(407,240)],"#859398")
    connector.masonry(16,13,("#909da0","#9aa4a4","#8b999d","#94a0a1"))
    ledge(s,[(403,145),(629,110)],"#4e5c61","#dce2d9",6)
    glass=Face(s,[(433,163),(600,143),(600,205),(433,210)],"#54676d")
    glass.panel(.025,.06,.975,.93,"#829095")
    glass.area("#a1a8a3",(.05,.1),(.9,.1),(.72,.39),(.15,.43))
    glass.area("#c7c6b3",(.29,.21),(.46,.17),(.43,.22),(.31,.25))
    glass.area("#c9cabb",(.62,.15),(.80,.11),(.75,.17),(.62,.19))
    for u in (.02,.49,.98):glass.line("#50646b",(u,0),(u,1),width=3)
    glass.line("#697b7f",(0,.57),(1,.55))
    ledge(s,[(425,213),(604,207)],"#67767a","#c7cfca",4)
    # Receding stone bay, cut by the red brick edge of the far right wing.
    bay=Face(s,[(623,106),(768,77),(768,279),(623,250)],"#89989a")
    bay.masonry(10,15,("#a2acaa","#a5afac","#9aa6a5","#adb4ac"))
    ledge(s,[(620,106),(768,72)],"#536368","#e1e6df",8)
    brick=Face(s,[(714,129),(768,112),(768,285),(714,268)],"#92756b")
    brick.masonry(6,21,("#95766b","#8d6e64","#a28273","#886a60"))
    # A desk, ceiling lamps and vertical blinds can just be seen along the long
    # office window. Uneven reflections of the winter sky cross the glass.
    glass.panel(.045,.58,.23,.81,"#677779");glass.panel(.07,.59,.18,.68,"#8d9690")
    glass.panel(.70,.36,.89,.76,"#9b9f95")
    for u in (.705,.733,.761,.789,.817,.845,.873):
        glass.line("#8b938b",(u,.37),(u+.008,.75))
    glass.area("#929d9e",(.05,.16),(.32,.12),(.16,.38),(.03,.40))
    glass.area("#9eaaa8",(.51,.38),(.73,.15),(.78,.13),(.55,.41))
    glass.panel(.06,.78,.29,.83,"#5e6b6c");glass.panel(.13,.70,.25,.77,"#768181")
    glass.line("#a2ada9",(.03,.08),(.965,.08));glass.line("#586c72",(.49,.07),(.49,.95),width=3)
    for wallpart in (wing,port,connector,bay):
        wallpart.grain(240,("#819296","#9fa9a5","#a4afa9","#8c9b9a"),.018)
    wash(s,[(198,136),(274,106),(273,153),(202,175)],"#48585c",.19)
    wash(s,[(277,109),(409,144),(406,158),(300,127)],"#46565d",.19)
    wash(s,[(627,113),(768,80),(768,98),(627,131)],"#576269",.29)
    for x,y in [(164,187),(159,191),(170,210),(732,169),(758,143)]:
        s.rect(x,y,5,2,"#84675c");s.rect(x+2,y+2,3,1,"#b09481")
    for x,y,size in [(216,163,6),(393,180,4),(674,154,7)]:
        s.rect(x,y,size+4,4,"#657177");s.rect(x+2,y+2,size,3,"#d7d6b8")
        s.rect(x+1,y+5,size+2,1,"#859095")
    # Capped drain pipe and joints echo the stepped stonework at the portal.
    s.line("#626e71",(210,134),(210,179),(213,183),(213,249),width=3)
    s.line("#8c9a9c",(209,138),(209,178),(212,183),(212,248))
    for y in (150,194,225):s.rect(209,y,6,2,"#687679")
    # Daylight snow: warm tops and blue carved shadows. Footprint-sized flecks,
    # tyre ruts and packed drifts use a few broad tone steps.
    s.poly("#dbe0dc",(0,300),(200,253),(302,247),(420,231),(623,231),(768,255),(768,432),(0,432))
    s.poly("#cbd3d2",(0,300),(164,265),(223,252),(287,251),(276,257),(201,270),(35,324),(0,326))
    s.poly("#b7c5c9",(207,265),(257,255),(275,253),(264,261),(219,272),(170,288))
    s.poly("#cbd5d5",(444,244),(510,224),(608,212),(623,216),(554,228),(479,247))
    s.poly("#eff1e7",(484,242),(535,223),(605,217),(620,215),(590,224),(548,231),(520,243))
    s.poly("#f4f3e8",(0,371),(62,344),(139,330),(186,317),(149,335),(72,352),(24,377))
    s.poly("#e8ece5",(367,291),(470,268),(515,255),(554,253),(510,271),(421,292))
    wash(s,[(0,301),(198,258),(280,246),(298,249),(194,274),(79,311),(0,332)],"#859da9",.30)
    for i in range(4):
        s.poly("#8d9a9b",(297-i*5,243+i*3),(381+i*5,235+i*3),(387+i*5,239+i*3),(291-i*5,247+i*3))
        s.line("#c9d3d0",(292-i*5,246+i*3),(386+i*5,238+i*3))
    s.line("#647478",(294,243),(293,232),(310,225),(310,232),width=2)
    s.line("#bdc9c7",(294,231),(310,224))
    # Wind-scoured troughs, compacted oval footprints and the rim of a
    # snow-covered drain break up the broad white foreground.
    for x,y,l in [(13,373,85),(237,317,60),(564,291,49),(598,344,103),(90,417,145),(379,382,57),(662,389,81)]:
        for i in range(12):
            dx=s.rng.randrange(l);dy=s.rng.randrange(-3,4)
            s.line(s.rng.choice(("#c8d2d3","#e4e9e4","#e9ebe1")),
                   (x+dx,y-dx*.23+dy),(x+dx+s.rng.randrange(3,15),y-dx*.23+dy-1))
    for i in range(11):
        t=i/11;xx=222+100*t+(i%2)*5;yy=327-57*t
        s.oval(xx,yy,7-3*t,2,"#bbc8c9");s.rect(xx+4,yy+2,3,1,"#ebede3")
    grate=Face(s,[(-21,418),(64,393),(97,398),(16,426)],"#adb7b7")
    grate.panel(.10,.17,.88,.74,"#8c9ba0")
    for i in range(13):grate.line("#c7d1cf",(i/15+.07,.21),(i/15+.07,.64))
    s.line("#f0f0e5",(7,413),(32,405),(48,403),(61,395),width=3)
    for i in range(430):
        x=s.rng.randrange(768);y=s.rng.randrange(266,432)
        if i%3==0 and x<330:continue
        s.line(s.rng.choice(("#cdd5d4","#e9ece4","#e9ede7","#d5dddb")),(x,y),(x+s.rng.randint(2,12),y-1))
    # One low blue refuse container and a pile of winter delivery crates below the corridor.
    dumpster=Face(s,[(453,224),(513,218),(513,248),(453,251)],"#526771")
    dumpster.planks(8,("#4b616c","#6d7e80"))
    s.poly("#728587",(453,224),(463,217),(519,212),(513,218))
    ledge(s,[(451,223),(512,217),(521,212)],"#687579","#d7ded7",3)
    for x,y,w,h,d in [(527,238,25,15,8),(547,242,34,20,10),(551,226,23,14,7)]:
        yard_crate(s,x,y,w,h,d);s.line("#e0e1cf",(x,y),(x+d,y-11),(x+w+d,y-7),width=2)
    s.poly("#bcc9cb",(260,277),(278,276),(362,294),(371,300),(301,285))
    winter_tree(s,274,277,215,8,"#506065","#7b8483")
    s.line("#536066",(273,277),(272,265),(270,255),width=3)
    s.oval(266,275,19,3,"#c0cdce");s.line("#819093",(269,277),(274,276),(281,277))
    # Near twigs are intentionally asymmetric and leave the lit corridor readable.
    for x,y,dx,dy in [(33,394,-11,-43),(41,391,4,-49),(18,394,-3,-29),(52,393,7,-37),(712,316,6,-34),(723,315,10,-22)]:
        s.line("#758084",(x,y),(x+dx*.45,y+dy*.58),(x+dx,y+dy))
        s.line("#899292",(x+dx*.45,y+dy*.58),(x+dx*.45-3,y+dy*.86))
    s.wire((40,-3),(163,127),7,"#57676d")
    # Bare, snow-dusted twigs overhang the yard from a tree off-camera, much
    # closer and darker than the snowy towers and the central tree.
    for path in [[(768,3),(740,13),(712,18),(689,28),(650,42),(619,45)],
                 [(747,11),(739,22),(726,28),(720,41)],[(712,18),(700,14),(683,15),(673,20)],
                 [(682,30),(674,41),(657,52),(655,59)],[(651,41),(638,35),(621,36)]]:
        s.line("#5c696d",*path,width=2 if len(path)>5 else 1)
        if len(path)>5:s.line("#c7cfd0",*((x,y-1) for x,y in path[:4]))
    return s.image
