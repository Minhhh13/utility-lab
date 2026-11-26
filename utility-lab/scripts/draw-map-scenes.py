"""Draw Utility Lab's original classic Counter-Strike postcards. Run with Python 3 and Pillow."""

import math
import random
from pathlib import Path

from PIL import Image, ImageColor, ImageDraw, ImageEnhance


WIDTH, HEIGHT = 768, 432
ART = Path(__file__).resolve().parents[1] / "public" / "art"


def mix(a, b, amount):
    pa, pb = ImageColor.getrgb(a), ImageColor.getrgb(b)
    return tuple(round(x + (y - x) * amount) for x, y in zip(pa, pb))


class Scene:
    def __init__(self, seed):
        self.image = Image.new("RGB", (WIDTH, HEIGHT))
        self.draw = ImageDraw.Draw(self.image)
        self.rng = random.Random(seed)

    def rect(self, x, y, w, h, color):
        if w >= 1 and h >= 1:
            self.draw.rectangle((int(x), int(y), int(x+w-1), int(y+h-1)), fill=color)

    def poly(self, color, *points):
        self.draw.polygon(points, fill=color)

    def line(self, color, *points, width=1):
        self.draw.line(points, fill=color, width=width)

    def oval(self, x, y, w, h, color):
        self.draw.ellipse((int(x), int(y), int(x+w-1), int(y+h-1)), fill=color)

    def sky(self, stops):
        for (lo, a), (hi, b) in zip(stops, stops[1:]):
            for y in range(lo, hi):
                self.rect(0, y, WIDTH, 1, mix(a, b, (y-lo)/(hi-lo)))

    def sun(self, x, y, r, color):
        self.oval(x-r, y-r, 2*r, 2*r, color)

    def hills(self, points, base, color):
        self.poly(color, (points[0][0], base), *points, (points[-1][0], base))

    def arch(self,x,y,w,h,c,roundness=.48):
        cap = max(2, int(w*roundness))
        self.oval(x,y,w,cap*2,c)
        self.rect(x,y+cap,w,h-cap,c)

    def wire(self, a, b, sag, color, width=1):
        pts=[]
        for n in range(49):
            t=n/48
            pts.append((round(a[0]+(b[0]-a[0])*t),round(a[1]+(b[1]-a[1])*t+4*sag*t*(1-t))))
        self.line(color,*pts,width=width)

    def palm(self,x,y,h,shade,lit,bend=10):
        crown=(x+bend,y-h)
        radius=max(1,h*.026)
        self.poly(shade,(x-radius,y),(x+radius,y),(crown[0]+radius*.52,crown[1]),(crown[0]-radius*.52,crown[1]))
        for j in range(2,int(h/8)):
            yy=y-j*8; xx=x+bend*(y-yy)/h
            self.line(lit,(xx-radius*.6,yy),(xx+radius*.35,yy-1))
        for dx,rise,drop in [(-.43,.17,.1),(-.47,.26,-.03),(-.32,.34,-.13),(-.09,.38,-.17),
                            (.20,.36,-.17),(.39,.33,-.07),(.48,.20,.07),(.40,.09,.19),(-.35,.06,.20)]:
            end=(crown[0]+int(dx*h), crown[1]+int(drop*h))
            mid=(crown[0]+int(dx*h*.5),crown[1]-int(rise*h))
            color=lit if dx<0 and rise>.1 else shade
            branch=[]
            for n in range(15):
                t=n/14
                px=(1-t)**2*crown[0]+2*t*(1-t)*mid[0]+t*t*end[0]
                py=(1-t)**2*crown[1]+2*t*(1-t)*mid[1]+t*t*end[1]
                branch.append((round(px),round(py)))
                if n==0: continue
                drape=h*.16*math.sin(t*math.pi)**.7
                self.poly(color,branch[-2],(px+dx*h*.08,py+2),
                          (px+dx*h*.14,py+drape),(px-2*dx,py+2))
            self.line(color,*branch)
        self.oval(crown[0]-3,crown[1]-2,7,6,shade)

    def foliage(self, x,y,w,h, colors, amount=40):
        # Cluster leaves in overlapping crowns. Glints sit on the sun-facing edges.
        for i in range(amount):
            t=self.rng.random()*math.tau
            r=math.sqrt(self.rng.random())
            px=x+w*.46*math.cos(t)*r; py=y+h*.40*math.sin(t)*r
            size=self.rng.randint(4, max(5,int(h*.28)))
            col=colors[0 if py>y else self.rng.randrange(len(colors))]
            self.poly(col,(px-size,py),(px-size+3,py-4),(px,py-size*.41),
                      (px+size*.72,py-3),(px+size,py+2),(px+size*.42,py+5),(px-size*.7,py+4))
            if py<y and self.rng.random()<.45:
                self.rect(px-size*.35,py-size*.40,self.rng.randint(2,6),1,colors[-1])

    def birds(self,flock,col):
        for x,y,s in flock:
            self.line(col,(x-2*s,y-s),(x,y),(x+s,y-s),(x+3*s,y-s))


def project(face, u, v):
    """Map a local rectangle onto a painted wall, walkway or cargo crate."""
    top_left, top_right, bottom_right, bottom_left = face
    return tuple(round((1-v)*((1-u)*top_left[i]+u*top_right[i])
                       +v*((1-u)*bottom_left[i]+u*bottom_right[i])) for i in (0, 1))


def patch(s, face, color, *uv):
    s.poly(color, *(project(face, u, v) for u, v in uv))


def stroke(s, face, color, *uv, width=1):
    s.line(color, *(project(face, u, v) for u, v in uv), width=width)


def blocks(s, face, palette, columns, rows, weather=.4):
    """Lay staggered masonry by hand onto any perspective face."""
    field, bed, glint, dark, pale = palette
    s.poly(field, *face)
    for row in range(rows):
        shift = -.5 if row % 2 else 0
        for col in range(columns+1):
            a, b = max(0,(col+shift)/columns), min(1,(col+1+shift)/columns)
            if b <= a:
                continue
            t, f = row/rows, (row+1)/rows
            w, h = b-a, f-t
            pick = s.rng.random()
            if pick < .23:
                patch(s,face,pale if pick < .095 else dark,(a,t),(b,t),(b,f),(a,f))
            # Mineral lenses, diagonal chips and the intermittent shadow below each block
            # roughen the edges of the brush geometry without blurring a single pixel.
            for k in range(4):
                u, v = a+w*s.rng.uniform(.06,.66), t+h*s.rng.uniform(.15,.88)
                lens = s.rng.uniform(.045,.27)*w
                p = mix(field, pale if k%2 else dark, s.rng.uniform(.4,.84))
                patch(s,face,p,(u,v),(u+lens*.38,v-h*.045),(u+lens,v-h*.022),
                      (u+lens*.83,v+h*.036),(u+lens*.17,v+h*.041))
            if pick > .72:
                chip=w*s.rng.uniform(.06,.19)
                patch(s,face,dark,(b-chip,f),(b,f-h*.15),(b,f))
                stroke(s,face,bed,(b-chip*.66,f),(b,f-h*.08))
            if f < 1:
                stroke(s,face,mix(bed,dark,.40),(a,f),(b,f))
            if b < 1:
                stroke(s,face,mix(bed,dark,.53),(b,t),(b,f))
            if s.rng.random() < .74:
                stroke(s,face,glint,(a+(b-a)*.07,t+.08/rows),(a+(b-a)*s.rng.uniform(.22,.77),t+.08/rows))
            if s.rng.random() < weather:
                pos = a+(b-a)*s.rng.uniform(.16,.78)
                mid = t+s.rng.uniform(.3,.74)/rows
                stroke(s,face,dark,(pos,mid),(min(b,pos+.12/columns),mid))
                stroke(s,face,glint,(pos,mid+.09/rows),(min(b,pos+.05/columns),mid+.09/rows))


def fret(s, face, palette, units):
    """The alternating carved sandstone border that trims GoldSrc Dust walls."""
    edge, bed, light = palette
    s.poly(bed,*face)
    for j in range(units):
        a=j/units; w=1/units
        stroke(s,face,edge,(a,.75),(a+.13*w,.75),(a+.13*w,.3),(a+.48*w,.3),
               (a+.48*w,.61),(a+.31*w,.61))
        stroke(s,face,light,(a+.51*w,.77),(a+.51*w,.53),(a+.74*w,.53),(a+.74*w,.24),(a+w,.24))
    stroke(s,face,light,(0,.02),(1,.02))
    stroke(s,face,edge,(0,.98),(1,.98),width=2)


def subface(face, a, t, b, f):
    return tuple(project(face,u,v) for u,v in [(a,t),(b,t),(b,f),(a,f)])


def palisade(s, face, col, courses, shades, niches, trim=True):
    blocks(s,face,shades,col,courses,.26)
    if trim:
        fret(s,subface(face,0,0,1,.073),(shades[1],shades[3],shades[2]),col*3)
    for center, width in niches:
        bottom=.68 if courses < 6 else .47
        f=subface(face,center-width/2,.18,center+width/2,bottom)
        arch=[(0,1),(0,.35),(.08,.2),(.24,.08),(.46,0),(.61,.02),(.85,.16),(1,.36),(1,1)]
        patch(s,f,shades[2],*arch)
        inner=subface(f,.045,.045,.96,.93)
        patch(s,inner,"#4b413c",*arch)
        inner=subface(inner,.1,.09,1,1)
        patch(s,inner,"#665643",*arch)
        for j in range(3):
            stroke(s,inner,"#5b4e40",(.04,.77+j*.09),(.97,.77+j*.09))
        # Short radial voussoirs make the recess read as carved stone.
        for p,q in [((.03,.36),(-.04,.32)),((.13,.17),(.09,.09)),((.32,.04),(.30,-.05)),
                    ((.54,.02),(.55,-.055)),((.77,.12),(.81,.04)),((.94,.26),(.99,.20))]:
            stroke(s,f,shades[1],p,q)


def desert_sky(s, source=False, rocky_bowl=False):
    if source:
        s.sky([(0,"#7e9daa"),(106,"#b9c6c4"),(206,"#e7dbc2"),(432,"#dac2a0")])
        upland, shade, lit = "#b9b2a1","#a99e91","#cebdab"
        points=[(-3,144),(34,129),(66,130),(97,111),(139,119),(176,145),(227,137),
                (267,153),(318,129),(349,134),(391,161),(461,122),(494,141),(523,118),
                (546,125),(582,105),(621,132),(655,118),(694,139),(724,120),(770,134)]
    elif rocky_bowl:
        s.sky([(0,"#737f88"),(71,"#a6a59b"),(142,"#cfc0a3"),(210,"#e2c08d"),(432,"#caa677")])
        upland, shade, lit = "#af8e77","#89756a","#c8a589"
        points=[(-4,111),(32,125),(58,116),(79,131),(98,114),(122,102),(148,108),
                (186,78),(209,68),(227,49),(242,51),(257,73),(277,84),(292,106),
                (320,111),(349,139),(384,121),(407,130),(440,105),(469,90),(490,104),
                (509,88),(529,105),(548,94),(579,118),(617,125),(636,106),(663,113),
                (688,95),(714,83),(739,97),(770,88)]
    else:
        s.sky([(0,"#537d95"),(85,"#8faeb6"),(170,"#d6cdc2"),(242,"#e6bd94"),(432,"#bc8e66")])
        upland, shade, lit = "#9e8476","#766c70","#c3a18b"
        points=[(-3,132),(28,109),(51,122),(81,108),(104,74),(119,65),(129,43),(144,52),
                (160,82),(177,96),(198,83),(219,116),(241,105),(263,129),(286,122),(307,100),
                (321,96),(345,64),(357,72),(378,113),(402,132),(425,111),(447,122),(475,92),
                (491,64),(503,66),(518,45),(536,55),(548,80),(568,73),(589,117),(623,136),
                (651,112),(678,124),(705,100),(722,85),(741,94),(770,73)]
    # Fine, drifting bands of high cloud break the straight sky gradient.
    for x,y,w in [(48,48,118),(189,28,82),(248,79,100),(377,37,135),(497,61,86),(625,26,90),(699,91,102)]:
        cloud = "#c4c7c0" if source else "#c5c5bb"
        s.poly(cloud,(x,y+4),(x+w*.22,y+3),(x+w*.42,y-2),(x+w*.66,y),(x+w*.77,y-1),
               (x+w*.73,y+1),(x+w,y+3),(x+w*.58,y+4),(x+w*.40,y+3),(x+w*.20,y+5))
    if not source:
        # Ragged banks of cloud above the mountain skyline, painted in three quiet values.
        for x,y,w,h in [(4,58,176,18),(276,38,152,13),(529,60,191,22)]:
            colors=("#b9afa1","#c8bdab","#d7cabc") if rocky_bowl else ("#9dabad","#bbc3bb","#d4d3c8")
            for j in range(38):
                u=s.rng.random()
                r=s.rng.uniform(.07,.17)*w
                px=x+w*u;py=y+h*(1-math.sin(math.pi*u))+.45*h*s.rng.random()
                s.poly(colors[j%3],(px-r,py),(px-r*.58,py-1),(px-r*.33,py-h*.16),
                       (px+r*.10,py-h*.16),(px+r*.48,py-h*.06),(px+r,py),(px+r*.15,py+1))
    natural=[]
    for (x,y),(xx,yy) in zip(points,points[1:]):
        natural.append((x,y))
        for ratio in [.24,.44,.67,.86]:
            natural.append((x+(xx-x)*ratio,y+(yy-y)*ratio+s.rng.randint(-3,3)))
    natural.append(points[-1])
    s.hills(natural,205,upland)
    for (x,y),(xx,yy) in zip(points,points[1:]):
        if abs(yy-y)<8: continue
        low=min(y,yy); peak=x if y==low else xx
        s.poly(shade if y<yy else lit,(x,y+1),(xx,yy+1),(xx+5,yy+12),
               (peak+11,low+26),(peak+17,low+44),(peak-5,low+23))
        s.line(upland,(peak+1,low+3),(peak+4,low+12),(peak+11,low+20))
        for j in range(6):
            u=s.rng.random();sx=x+(xx-x)*u;sy=y+(yy-y)*u+s.rng.randrange(5,35)
            s.line(mix(upland,shade,.45),(sx,sy),(sx+2,sy+4),(sx+1,sy+6),(sx+4,sy+9))
    s.hills([(-2,159),(31,147),(66,158),(93,146),(132,152),(178,137),(220,160),
             (286,151),(352,163),(426,146),(468,160),(532,145),(599,160),(663,141),
             (719,158),(770,146)],222,"#b4a292" if source else "#8a7971")


def cobbles(s, face, colors, col=17, row=9):
    """Paving with irregular courses crowding together toward the horizon."""
    base, joint, light, fleck, worn=colors
    s.poly(base,*face)
    for j in range(row):
        top=(j/row)**1.65; low=((j+1)/row)**1.65
        for i in range(-1,col+1):
            shift=(j%2)*.5
            a=max(0,(i+shift)/col); b=min(1,(i+1+shift)/col)
            if b<=a: continue
            c=s.rng.choice([base,base,base,fleck,worn])
            h=low-top; w=b-a
            patch(s,face,c,(a+.06*w,top+.10*h),(a+.78*w,top),(b,top+.18*h),
                  (b,low-.19*h),(b-.16*w,low),(a,low-.09*h))
            stroke(s,face,joint,(a+.12*w,low),(b-.10*w,low),(b,low-.19*h))
            if j>3:
                stroke(s,face,light,(a+.05*w,top+.19*h),(a+.37*w,top+.08*h))
                for k in range(3):
                    u=a+w*s.rng.uniform(.16,.77);v=top+h*s.rng.uniform(.3,.77)
                    patch(s,face,mix(fleck,base,s.rng.random()),(u,v),(u+w*.09,v-h*.08),
                          (u+w*.17,v),(u+w*.03,v+h*.05))
                if s.rng.random()<.17:
                    stroke(s,face,joint,(a+w*.80,top+h*.95),(a+w*.66,top+h*.68),(a+w*.7,top+h*.55))


def cargo(s, x,y,w,h,d, military=True):
    if military:
        front=("#818467","#5c6352","#a1a07b","#70775e","#919477")
        side=("#676e5a","#4d554a","#85896a","#5b6352","#727761")
        highlight="#aca681"; rail="#49534a"; stripe="#b69d66"
    else:
        front=("#a38560","#695a4c","#b69a73","#917653","#ab8c68")
        side=("#877153","#5c5143","#a58b66","#78644d","#967e5e")
        highlight="#c0a078"; rail="#77634c"; stripe=None
    front_face=[(x,y),(x+w,y+4),(x+w,y+h+4),(x,y+h)]
    side_face=[(x+w,y+4),(x+w+d,y-d*.58),(x+w+d,y+h-d*.58),(x+w,y+h+4)]
    lid=[(x,y),(x+d,y-d*.58-4),(x+w+d,y-d*.58),(x+w,y+4)]
    for face,p in [(front_face,front),(side_face,side),(lid,side)]:
        blocks(s,face,p,6,1,.8)
        for o in (.08,.86):
            patch(s,face,p[1],(o,0),(o+.065,0),(o+.065,1),(o,1))
            stroke(s,face,p[2],(o,.03),(o,.94))
        stroke(s,face,highlight,(0,.03),(1,.03),width=2)
        if military:
            patch(s,face,rail,(0,.76),(1,.76),(1,.94),(0,.94))
            for j in range(7):
                a=j/7; b=(j+.39)/7
                patch(s,face,stripe,(a,.92),(b,.92),(min(1,b+.036),.77),(a+.036,.77))
        elif face != lid:
            for begin,end in [((.13,.88),(.84,.1)),((.12,.1),(.84,.88))]:
                stroke(s,face,p[1],begin,end,width=max(2,int(w*.062)))
                stroke(s,face,p[4],begin,end,width=max(1,int(w*.031)))
        if min(w,h)>38:
            for j in range(38):
                u=s.rng.uniform(.025,.95);v=s.rng.uniform(.1,.71)
                if military:
                    stroke(s,face,s.rng.choice((p[3],p[4])),(u,v),(u+.005,v+.013),
                           (u+.016,v+.02))
                else:
                    length=s.rng.uniform(.02,.17)
                    stroke(s,face,s.rng.choice((p[3],p[4])),(u,v),(u+.009,v+length*.6),(u+.006,v+length))
            for u in [.1,.88]:
                for v in [.13,.61,.89]:
                    xx,yy=project(face,u,v);s.rect(xx,yy,2,2,rail);s.rect(xx,yy,1,1,highlight)
        stroke(s,face,rail,(0,1),(1,1))
    if military and w>28:
        patch(s,front_face,front[1],(.24,.31),(.4,.31),(.4,.44),(.24,.44))
        for j in range(3): stroke(s,front_face,front[2],(.46,.32+j*.05),(.64-j*.035,.32+j*.05))


def dust_1999():
    s=Scene(1999)
    desert_sky(s)
    s.rect(0,244,768,190,"#b69a74")
    sun=("#c6a478","#ab8966","#dec095","#b89a74","#ccaf84")
    warm=("#b39773","#8c765e","#c9ad84","#a68a68","#bfa17a")
    shade=("#9b8062","#796957","#b09570","#90765c","#a58968")
    # A low, square tunnel carries the upper passage. The pit opens into a bank of steps.
    left=[(-16,83),(288,146),(288,291),(-16,385)]
    right=[(538,152),(782,103),(782,305),(538,267)]
    palisade(s,left,11,8,sun,[(.16,.12),(.42,.12),(.67,.125),(.88,.10)])
    palisade(s,right,10,7,sun,[(.28,.15),(.58,.15),(.87,.14)])
    blocks(s,[(287,145),(540,151),(540,268),(287,292)],warm,10,7)
    top=[(280,125),(546,130),(546,196),(280,198)]
    palisade(s,top,11,4,warm,[(.13,.135),(.33,.135),(.70,.13),(.89,.13)])
    # Tunnel interior and the turn into the second opening, framed by chipped sill stones.
    s.poly("#4b4641",(289,197),(523,195),(523,269),(289,290))
    s.poly("#5d5146",(289,197),(347,222),(347,260),(289,290))
    s.poly("#383a39",(291,198),(523,195),(462,223),(347,223))
    s.poly("#665546",(462,222),(523,195),(523,269),(461,256))
    blocks(s,[(347,223),(461,223),(461,258),(347,260)],shade,7,3,.1)
    s.rect(385,226,49,31,"#46423d")
    for yy in [230,237,244,251]:
        s.line("#8a7357",(292,yy+6),(345,yy+10))
    fret(s,[(279,191),(545,190),(545,196),(279,200)],("#786957","#ac946f","#d0b98a"),33)
    # The sloping original cobblestone lane occupies the bottom of the composition.
    cobbles(s,[(-4,334),(523,255),(775,331),(781,450)],("#b99c77","#a18468","#d6b78b","#bea27d","#ad9475"),19,7)
    cobbles(s,[(-5,326),(341,257),(461,256),(-5,434)],("#bda17d","#988069","#d8bb91","#b49978","#c8ac85"),11,11)
    s.poly("#93816f",(-4,388),(289,291),(348,259),(285,280),(146,309),(-4,345))
    # On the right of the pit, broad stairs climb back to the higher deck.
    for j in reversed(range(9)):
        t=j/9; tn=(j+1)/9
        def step(u,far):
            return (round(488+100*far+(196+46*far)*u),round(286+13*far+u*(53-116*far)))
        a,b,c,d=step(t,0),step(t,1),step(tn,1),step(tn,0)
        s.poly("#d4b38a",a,b,(c[0],c[1]-4),(d[0],d[1]-4))
        s.poly("#9f835f",(d[0],d[1]-4),(c[0],c[1]-4),c,d)
        s.line("#e7c89b",a,b)
    # Stone coping and the carved frieze caught in raking light along the ramp.
    ramp=[(-6,376),(293,282),(293,293),(-6,397)]
    fret(s,ramp,("#786757","#ac916d","#dbbe92"),33)
    cargo(s,299,250,26,29,9,True)
    cargo(s,461,259,32,33,10,False)
    cargo(s,499,251,24,27,9,False)
    cargo(s,462,232,23,25,8,False)
    # Weathered paving along the rim in the immediate foreground.
    cobbles(s,[(-50,407),(99,348),(468,433),(-21,472)],
            ("#b49975","#90795f","#c8ac82","#b19876","#bea47e"),10,5)
    # Foreground ledge provides a solid edge to the sunlit side of the cut.
    blocks(s,[(-5,374),(111,338),(111,357),(-5,407)],shade,5,2)
    fret(s,[(-5,367),(111,335),(111,343),(-5,382)],("#746653","#ad916a","#e4c18d"),15)
    cargo(s,653,328,80,74,28,False)
    cargo(s,714,271,55,52,20,False)
    for sx,sy in [(40,334),(90,323),(228,284),(417,272),(274,372)]:
        for j in range(7):
            x=sx+s.rng.randrange(-12,16);y=sy+s.rng.randrange(-2,4);w=s.rng.randrange(2,5)
            s.poly("#aa906b",(x-w,y),(x-w*.4,y-2),(x+w*.4,y-2),(x+w,y))
            s.line("#d5b486",(x-w*.4,y-2),(x+w*.3,y-2))
    return s.image


def cupola(s,x,y,w,h):
    s.oval(x,y,w,h*2,"#a9ab94")
    for offset,c in [(.08,"#b3b5a0"),(.2,"#bbbca5"),(.35,"#c2c3ae")]:
        s.draw.arc((x+int(w*offset),y,x+w-int(w*offset),y+h*2),182,327,fill=c,width=1)
    s.line("#8e9487",(x+w*.51,y-6),(x+w*.51,y+2))
    s.rect(x+w*.46,y-4,w*.1,2,"#8c9584")


def sedan(s,x,y,k):
    """Abandoned Source-era saloon with two-tone glass, chrome rails and open door."""
    def body(c,*p): s.poly(c,*[(x+a*k,y+b*k) for a,b in p])
    def mark(c,*p,w=1): s.line(c,*[(x+a*k,y+b*k) for a,b in p],width=max(1,round(w*k)))
    body("#8f8b79",(-7,9),(56,25),(95,7),(66,0),(24,-9))
    for a,b in [(12,5),(62,10)]:
        s.oval(x+(a-4)*k,y+(b-5)*k,11*k,14*k,"#464c4a")
        s.oval(x+(a-1)*k,y+(b-2)*k,5*k,7*k,"#888c81")
    body("#c7c9b3",(0,-3),(15,-10),(27,-19),(50,-20),(68,-13),(81,-9),(92,-3),(91,4),
         (66,12),(62,7),(58,7),(57,14),(19,8),(17,3),(12,2),(10,7),(1,4))
    body("#eeead6",(0,-4),(14,-10),(46,-6),(66,0),(60,4),(25,1))
    body("#7e999a",(17,-10),(29,-18),(47,-18),(43,-7))
    body("#597b80",(47,-7),(51,-17),(61,-13),(69,-7),(67,-3))
    body("#a8bbb3",(24,-11),(30,-16),(36,-16),(30,-10))
    body("#858c80",(68,0),(91,-6),(91,2),(67,11))
    mark("#f1edd1",(71,-1),(91,-6));mark("#727e77",(0,2),(11,3));mark("#b1b4a3",(20,4),(55,10))
    body("#afb3a3",(44,-6),(60,-1),(50,5),(42,1));mark("#565e58",(43,-4),(42,2),(50,6),(60,-1))
    mark("#ab624f",(84,-3),(90,-5),w=2);mark("#d9d6be",(75,4),(81,2),w=2)


def plaster(s, face, colors):
    """Worn limewash over intact stone courses and patches of exposed aggregate."""
    body, shade, light, aggregate = colors
    for i in range(320):
        u,v=s.rng.uniform(.015,.97),s.rng.uniform(.025,.94)
        w,h=s.rng.uniform(.004,.032),s.rng.uniform(.004,.025)
        p=s.rng.choice((body,light,shade))
        patch(s,face,p,(u,v+h*.24),(u+w*.45,v),(u+w,v+h*.15),
              (u+w*.62,v+h),(u+w*.17,v+h*.76))
    for center,depth,width in [(.06,.19,.035),(.26,.08,.023),(.52,.13,.044),(.82,.17,.04),(.95,.11,.03)]:
        v=s.rng.uniform(.3,.79)
        path=[(center-width,v),(center,v+.04),(center+width,v+.03),
              (center+width*.67,v+.065),(center+width*.83,v+.1),
              (center,v+depth),(center-width*.38,v+.085),(center-width*.52,v+.04)]
        patch(s,face,aggregate,*path)
        stroke(s,face,light,*path[:4])
        stroke(s,face,shade,(center+width*.25,v+depth),(center+width*.40,v+depth+.022),
               (center+width*.18,v+depth+.047))
    for v in [.04,.06,.91,.94]:stroke(s,face,shade,(0,v),(1,v))


def dust_source():
    s=Scene(2004)
    desert_sky(s,True)
    s.rect(0,235,768,200,"#d4c7a5")
    chalk=("#dbcca5","#c1b18f","#eee0b8","#cfc09d","#e1d3b0")
    shade=("#b6a88e","#9d917c","#cfc2a0","#aea087","#c0b299")
    sun=("#cfc09b","#ab9d82","#e4d4ac","#c3b28f","#d8c8a6")
    # The Source skyline has plaster domes, palm crowns and telephone wires.
    for x,y,w,h in [(72,182,63,60),(218,175,74,49),(379,169,68,50),(483,163,107,59)]:
        s.rect(x,y-h,w,h,"#c5bdA5")
        s.rect(x-2,y-h-2,w+4,4,"#d8ceb4")
        for f in range(2,int(w/12)):
            s.rect(x+f*11,y-h+7,3,6,"#a4a696")
    for x,y,h in [(39,148,88),(187,162,47),(317,167,45),(423,161,47),(655,121,78),(693,122,63)]:
        s.palm(x,y,h,"#839589","#a2ac93",bend=6)
    # Long central hall over the road, with the distinctive arcaded drum above its flank.
    left=[(-8,133),(297,152),(297,247),(-8,281)]
    blocks(s,left,sun,13,6,.25)
    blocks(s,[(294,150),(459,155),(459,221),(294,249)],shade,8,5)
    hall=[(450,100),(659,73),(659,246),(450,220)]
    shallow=[(379,138),(450,100),(450,220),(379,207)]
    cupola(s,472,53,134,52);cupola(s,601,71,71,29)
    blocks(s,shallow,shade,5,7);blocks(s,hall,chalk,10,8)
    plaster(s,hall,("#d5c59e","#c4b695","#e5d5ad","#bba98a"))
    plaster(s,shallow,("#b3aa8e","#a99f87","#c6b99b","#9f957e"))
    for f in [.12,.32,.53,.74,.91]:
        niche=subface(hall,f-.025,.19,f+.025,.46)
        patch(s,niche,"#777f74",(0,1),(0,.2),(.5,0),(1,.2),(1,1))
        stroke(s,niche,"#e8dab4",(0,1),(0,.2),(.5,0))
    for f in [.2,.6]:
        sub=subface(shallow,f-.05,.2,f+.05,.44)
        patch(s,sub,"#858b79",(0,1),(0,.2),(.5,0),(1,.2),(1,1))
    for v in [.07,.11,.71,.75]: stroke(s,hall,"#bcaf90",(0,v),(1,v))
    stroke(s,hall,"#eddfb6",(0,0),(1,0),width=3)
    for x,y in [(460,95),(565,78),(646,69)]:
        s.rect(x-3,y-6,6,11,"#d4c49e")
        s.oval(x-3,y-9,6,7,"#acb29a")
        s.rect(x,y-12,1,4,"#838b7b")
    # Stone entry through a broad, shallow ramp pit and through-road above.
    s.poly("#645f54",(104,205),(292,188),(292,234),(104,268))
    s.poly("#4b514d",(108,208),(291,191),(254,209),(170,223))
    s.poly("#827d6a",(170,223),(254,209),(254,236),(170,248))
    s.poly("#545952",(193,226),(243,217),(243,237),(193,245))
    throat=[(89,181),(311,164),(311,189),(89,211)]
    blocks(s,throat,sun,10,2)
    stroke(s,throat,"#e1d3ac",(0,.04),(1,.04),width=3)
    # A broad, flared courtyard is sun-bleached and paved in narrow blocks.
    cobbles(s,[(-32,274),(385,201),(797,251),(782,460)],("#d9cbaa","#c6b89b","#e8dab8","#d0c1a1","#dfd1b0"),21,14)
    # A cut through the courtyard surface reveals the three planes of the underpass.
    # Its dark recess is visible from above between the long retaining wall and stairs.
    s.poly("#9c987f",(-4,261),(106,211),(287,188),(287,220),(100,266),(32,286),(-4,285))
    s.poly("#696c60",(105,211),(287,188),(287,219),(105,261))
    s.poly("#535b53",(107,212),(286,189),(253,203),(151,224))
    s.poly("#797d68",(151,224),(253,203),(253,222),(151,245))
    s.poly("#4d554d",(176,223),(239,210),(239,224),(176,240))
    s.poly("#a79e80",(104,259),(153,243),(254,222),(286,218),(243,235),(133,261),(68,279))
    for i in range(4):
        x=112+7*i
        s.line("#777c6b",(x,214+i),(x,250-i*2))
    # Two parapet walls and the steps align with the pit, not with the picture edge.
    edge=[(-9,237),(131,200),(131,215),(-9,267)]
    blocks(s,edge,shade,8,2);stroke(s,edge,"#f1dfb8",(0,0),(1,0),width=3)
    for j in range(7):
        t=j/7
        x=236+t*80; y=231-t*28
        s.poly("#b5aa91",(x,y),(x+55,y-13),(x+55,y-11),(x,y+3))
        s.line("#f0dfbb",(x,y-1),(x+55,y-14))
    # Carved timber doors set into the high eastern wall, little metal studs along each board.
    east=[(656,78),(771,58),(771,260),(656,246)]
    blocks(s,east,sun,5,9)
    plaster(s,east,("#cbbc98","#b7a788","#ddcba6","#a99b7d"))
    doors=subface(east,.20,.25,.90,.93)
    patch(s,doors,"#786a5a",(0,1),(0,.14),(.1,.08),(.25,0),(.73,0),(.91,.07),(1,.15),(1,1))
    for f in range(1,11):
        u=f/11;stroke(s,doors,"#928775",(u,.1),(u,.98))
    for r in [.25,.52,.8]:stroke(s,doors,"#675f55",(.02,r),(.96,r),width=2)
    s.poly("#aa9f86",(396,222),(451,213),(655,246),(697,272),(631,275),(500,246))
    sedan(s,496,290,1.55)
    # Palm shadows fall across the closest sandy paving stones.
    s.poly("#b8ab90",(-4,333),(16,328),(138,428),(116,437),(-4,353))
    for j in range(8):
        x=33+j*12;y=343+j*9
        s.poly("#b7aa8e",(x,y),(x-12,y-14),(x-31-j*2,y-26),(x-24,y-17))
        s.poly("#bcae90",(x,y),(x+11,y-20),(x+22+j,y-28),(x+16,y-15))
    # Foreground C-shaped curb, paint-worn oil drum, chips and sparse desert grass.
    for x,y,k in [(87,281,.52),(51,290,.67),(311,220,.29)]:
        s.rect(x,y-28*k,18*k,27*k,"#947c69")
        s.oval(x,y-31*k,18*k,6*k,"#aa9780")
        for a in [7,19]:s.rect(x,y-a*k,18*k,2*k,"#6f7365")
    for x,y,k in [(56,374,.92),(23,395,1.12)]:
        s.poly("#aba18a",(x-4,y),(x+18*k,y+8*k),(x+50*k,y+1),(x+20*k,y-7))
        s.rect(x,y-36*k,26*k,36*k,"#9b826d")
        s.rect(x+4*k,y-35*k,6*k,35*k,"#ae9279")
        s.oval(x,y-40*k,26*k,8*k,"#c5ab89")
        s.oval(x+2*k,y-39*k,22*k,5*k,"#9b8f77")
        s.oval(x+5*k,y-38*k,5*k,2*k,"#6b7062")
        for t in [6,20,31]:
            s.rect(x,y-t*k,26*k,2*k,"#807b67")
            s.rect(x+1,y-(t+1)*k,23*k,1,"#c1a17c")
        s.poly("#9d8870",(x+15*k,y-22*k),(x+19*k,y-25*k),(x+22*k,y-21*k),(x+17*k,y-18*k))
    for i in range(125):
        x=s.rng.randrange(768);y=s.rng.randrange(307,432)
        s.rect(x,y,s.rng.randint(1,5),1,s.rng.choice(["#c0b499","#d5c5a2","#eeddb8"]))
    s.wire((-10,15),(362,122),20,"#616e6c")
    s.wire((362,122),(770,74),22,"#6c7771")
    s.line("#858d7c",(361,98),(362,161),width=2);s.line("#8b917c",(354,119),(371,120),width=2)
    return s.image


def cliff(s, ridge, base, palette):
    lit, mid, shade, cut = palette
    s.hills(ridge,base,mid)
    for (x,y),(xx,yy) in zip(ridge,ridge[1:]):
        dx=xx-x
        s.poly(shade,(x,y),(x+dx*.3,y+10),(x+dx*.2,y+25),(x+dx*.75,yy+39),
               (x+dx*.8,base),(xx,base),(xx,yy))
        for j in range(3):
            offset=j*21+s.rng.randrange(3,10)
            s.line(cut if j==1 else lit,(x,y+offset),(x+dx*.35,y+offset+4),
                   (x+dx*.57,(y+yy)/2+offset+2),(xx-2,yy+offset-3),width=2 if j==1 else 1)
        s.line(lit,(x,y),(x+dx*.32,y+(yy-y)*.32),(x+dx*.53,y+(yy-y)*.54))


def site_doors(s,x,y,w,h):
    """Two heavy timber leaves, with the iron pins and ring pulls of the old doors."""
    c=h*.43
    s.arch(x-5,y-5,w+10,h+5,"#8f7458",roundness=.46)
    s.arch(x-2,y-2,w+4,h+2,"#c2a278",roundness=.46)
    s.arch(x,y,w,h,"#423e35",roundness=.46)
    for j in range(14):
        f=(j+.5)/14; radius=max(.01,1-(2*f-1)**2)
        head=y+c*(1-math.sqrt(radius))+4
        start=x+2+w*j/14; end=x+w*(j+1)/14-1
        s.poly(s.rng.choice(["#817057","#78664f","#70604c","#877358"]),
               (start,head),(end,head),(end,y+h-1),(start,y+h-1))
        s.line("#9a8664",(start+1,head+1),(start+1,y+h-3))
        for _ in range(3):
            yy=s.rng.uniform(head+1,y+h-3);xx=s.rng.uniform(start,end)
            s.line("#6a604d",(xx,yy),(xx,min(y+h-3,yy+s.rng.randrange(5,19))))
    s.line("#3e4139",(x+w*.5,y+2),(x+w*.5,y+h),width=max(3,int(w*.032)))
    for f in [.36,.71,.91]:
        for lo,hi in [(.025,.455),(.545,.985)]:
            xx=x+lo*w; yy=y+f*h
            s.rect(xx,yy,w*(hi-lo),max(2,h*.033),"#595747")
            s.line("#93876a",(xx,yy),(x+hi*w,yy))
            for k in range(4):
                sx=xx+(hi-lo)*w*(k+.5)/4
                s.rect(sx,yy+1,2,2,"#373e36")
    for f in [.44,.56]:
        s.oval(x+w*f-2,y+h*.59,5,6,"#484b40")
        s.rect(x+w*f-1,y+h*.59+1,2,2,"#ad9c78")
    # Radial arch blocks carry the curved gate into the old blockwork.
    for j in range(11):
        a=math.pi+math.pi*j/10
        inner=(x+w*.5+(w*.5+2)*math.cos(a),y+c+(c+1)*math.sin(a))
        outer=(x+w*.5+(w*.5+8)*math.cos(a),y+c+(c+8)*math.sin(a))
        s.line("#9b8668",inner,outer)


def dust2():
    s=Scene(1600)
    desert_sky(s,rocky_bowl=True)
    # Old B is a compact stone yard within a natural rock bowl.
    cliff(s,[(-8,162),(38,132),(78,141),(122,107),(171,125),(215,104),(251,121),(279,111),
             (311,129),(349,121),(391,137),(429,110),(465,119),(504,100),(533,109),(568,94),
             (605,114),(632,91),(677,107),(710,86),(747,96),(778,80)],255,
          ("#baa184","#a18972","#8c7665","#887562"))
    sun=("#c9ac80","#a38969","#dfbf91","#bda07a","#d4b68a")
    shade=("#aa9273","#89785f","#c3aa83","#9d876b","#b29a79")
    side=[(-4,89),(270,162),(270,260),(-4,365)]
    palisade(s,side,10,7,shade,[(.43,.15),(.68,.15),(.9,.13)])
    gate=[(261,138),(515,136),(515,262),(261,265)]
    blocks(s,gate,sun,12,7)
    fret(s,subface(gate,0,0,1,.07),("#927a5c","#bea27b","#dfbd8b"),31)
    site_doors(s,323,151,113,112)
    # The wall to the right readily breaks back into the rocky perimeter.
    cliff(s,[(515,170),(532,153),(563,157),(593,146),(618,149),(647,127),(672,132),
             (709,116),(734,125),(774,111)],269,("#c6a77b","#ae8c6a","#967b61","#917559"))
    # A worn cobbled approach cuts across warm packed earth in the site.
    s.poly("#c8ad83",(-6,307),(258,258),(512,252),(780,266),(780,445),(-6,445))
    for j in range(500):
        x=s.rng.randrange(770);y=s.rng.randrange(267,435)
        s.rect(x,y,s.rng.randrange(1,5),1,s.rng.choice(["#d8bb8f","#c2a781","#b49d7a"]))
    cobbles(s,[(240,269),(282,260),(764,435),(449,435)],("#b8a17e","#a18e70","#d2bb92","#b49d7b","#c1a884"),6,14)
    s.poly("#9a876d",(-4,345),(266,261),(310,263),(185,313),(45,373),(-4,376))
    # Spray ring and B stencil painted between the stacks, in receding perspective.
    s.draw.arc((307,293,447,318),13,324,fill="#a25c45",width=3)
    s.line("#ae654a",(386,287),(358,320),width=3)
    s.line("#a25c45",(383,294),(410,294),(414,298),(397,301),(377,301),width=2)
    s.line("#a25c45",(380,301),(397,301),(401,306),(387,311),(369,311),width=2)
    for x,y,w in [(298,308,13),(417,297,10),(348,320,8),(388,289,6)]:s.rect(x,y,w,1,"#bd805d")
    # The old military crates have olive panels and narrow diagonal black/yellow bands.
    for x,y,w,h,depth in [(482,252,41,35,14),(585,240,53,51,19),(589,192,49,45,18)]:
        s.poly("#a28f70",(x+2,y+h-1),(x+w+depth,y+h-6),(x+w+depth+30,y+h+2),(x+22,y+h+13))
        cargo(s,x,y,w,h,depth)
    cargo(s,129,284,66,53,20)
    cargo(s,60,282,65,57,22)
    cargo(s,90,223,63,59,20)
    cargo(s,620,270,68,62,23,False)
    # Large struts of the original tunnel frame this view into the back of B.
    pillar=[(-10,-10),(52,-10),(47,434),(-10,434)]
    blocks(s,pillar,("#897966","#665e52","#a08e72","#806e5d","#92806a"),3,16)
    s.poly("#665f54",(-2,0),(155,0),(111,23),(59,58),(46,100),(43,53))
    s.line("#a38d73",(48,96),(63,60),(108,25),(153,1),width=2)
    cargo(s,691,338,84,87,27,False)
    return s.image


def ruin_border(s, face, n):
    s.poly("#64776b",*face)
    for i in range(n):
        start=i/n; w=1/n
        stroke(s,face,"#384d49",(start,.79),(start+w*.17,.79),(start+w*.17,.29),
               (start+w*.67,.29),(start+w*.67,.57),(start+w*.39,.57),width=2)
        stroke(s,face,"#8d9a7f",(start+w*.20,.22),(start+w*.75,.22),(start+w*.75,.78),(start+w*.95,.78))
    stroke(s,face,"#95a18a",(0,.02),(1,.02));stroke(s,face,"#394e49",(0,.98),(1,.98),width=2)


def moss_seams(s, face, n):
    for j in range(n):
        a=s.rng.uniform(.015,.97);t=s.rng.uniform(.02,.95)
        if j%3: t*=.35
        length=s.rng.uniform(.013,.065);w=s.rng.uniform(.012,.036)
        patch(s,face,s.rng.choice(["#74816a","#7c8d70","#63765f"]),
              (a,t),(a+w*.6,t-.003),(a+w,t+.003),(a+w*.7,t+.022),
              (a+w*.3,t+.017),(a+w*.15,t+length),(a,t+length*.65))


def trailing_plants(s, face, center, length, density):
    for i in range(density):
        u=center+s.rng.uniform(-.05,.05); v=0
        steps=max(2,int(s.rng.uniform(.3,1)*length))
        for j in range(steps):
            next_u=u+s.rng.uniform(-.012,.012); next_v=v+s.rng.uniform(.012,.027)
            stroke(s,face,"#566d59",(u,v),(next_u,next_v))
            width=s.rng.choice((-.017,.017))
            patch(s,face,s.rng.choice(["#78876a","#677f63","#8d9870"]),
                  (next_u,next_v),(next_u+width,next_v-.012),(next_u+width*.56,next_v+.011))
            u,v=next_u,next_v


def aztec():
    s=Scene(1606)
    s.sky([(0,"#536774"),(88,"#889a9d"),(178,"#abada1"),(270,"#85918a"),(432,"#637d78")])
    for x,y,w,h in [(-30,57,158,19),(84,36,124,16),(265,77,101,12),(399,43,183,21),(592,62,103,14),(682,34,131,23)]:
        s.poly("#869393",(x,y+h),(x+w*.10,y+h*.65),(x+w*.23,y+h*.51),(x+w*.30,y+h*.10),
               (x+w*.43,y+h*.3),(x+w*.57,y),(x+w*.72,y+h*.43),(x+w*.85,y+h*.45),
               (x+w*.92,y+h*.71),(x+w,y+h*.82),(x+w*.55,y+h*.8))
    ridge=[(-5,140),(36,130),(71,133),(110,122),(140,139),(183,120),(211,125),(243,113),
           (275,121),(306,106),(331,116),(365,111),(397,122),(434,99),(466,106),(485,94),
           (504,106),(542,95),(574,111),(606,104),(638,119),(679,103),(719,113),(774,101)]
    s.hills(ridge,216,"#718980")
    for x,y in ridge[::2]:
        s.foliage(x,y+6,68,20,("#74897c","#7f9383","#8b9c8b"),24)
    sun=("#8a9786","#64786e","#a4ae96","#7d8d7e","#94a18e")
    shade=("#718479","#546e64","#8b9d88","#687d71","#7c8e7f")
    dark=("#5e7469","#455f57","#80947e","#556c62","#6b7d6e")
    # The enclosed stone riverbed, with reflected courses of stone and widening ripples.
    s.poly("#5d7971",(-8,329),(409,206),(731,236),(779,434),(-8,434))
    s.poly("#6c8579",(86,434),(432,222),(490,222),(472,250),(427,290),(415,294),
           (389,332),(370,341),(337,383),(323,393),(296,434))
    s.poly("#526f64",(556,247),(771,300),(771,432),(734,432),(723,417),(694,403),
           (682,388),(641,359),(637,346),(605,327),(608,315),(582,288),(582,278))
    for _ in range(1200):
        y=s.rng.randint(229,432);x=s.rng.randint(0,768)
        w=int(1+(y-218)*s.rng.uniform(.015,.104))
        s.line(s.rng.choice(["#68867b","#7d9686","#8fa294","#567469"]),(x,y),(x+w,y))
    west=[(91,115),(310,135),(310,239),(91,339)]
    blocks(s,west,shade,12,8)
    ruin_border(s,subface(west,0,.07,1,.14),18)
    moss_seams(s,west,60)
    for f in [.2,.44,.75]:
        trailing_plants(s,west,f,8,8)
    # Distant connecting stone hall, high openings and broken slabs along its foot.
    end=[(305,134),(530,130),(530,238),(305,237)]
    blocks(s,end,sun,16,9)
    for a,b in [(.13,.31),(.50,.64),(.78,.91)]:
        f=subface(end,a,.31,b,.64)
        patch(s,f,"#495f57",(0,0),(1,0),(1,1),(0,1))
        stroke(s,f,"#adb4a1",(0,1),(1,1))
    ruin_border(s,subface(end,0,.11,1,.18),23)
    for f in [.34,.78,.93]:trailing_plants(s,end,f,8,7)
    for a,b in [(.04,.22),(.71,.9)]:
        f=subface(end,a,.74,b,1)
        patch(s,f,"#4d6962",(0,1),(0,.3),(.13,.08),(.46,0),(.74,.08),(1,.32),(1,1))
    # Tall landing towers stand on either bank; the bridge enters the rectangular portal.
    far_side=[(533,84),(774,121),(774,343),(533,238)]
    far_front=[(432,112),(533,84),(533,238),(432,250)]
    blocks(s,far_side,shade,11,10);blocks(s,far_front,sun,5,10)
    ruin_border(s,subface(far_front,0,.11,1,.19),8)
    ruin_border(s,subface(far_side,0,.11,1,.19),19)
    portal=subface(far_front,.27,.31,.83,.71)
    patch(s,portal,"#3d514d",(0,1),(0,.07),(.07,0),(.95,0),(1,.06),(1,1))
    patch(s,portal,"#53665c",(.1,.13),(.30,.20),(.30,.85),(.08,1))
    patch(s,portal,"#738576",(.08,1),(.30,.83),(.85,.79),(1,1))
    stroke(s,portal,"#abb298",(0,1),(0,0),(1,0),width=2)
    moss_seams(s,far_front,36);moss_seams(s,far_side,62)
    for f in [.08,.31,.64,.87]:trailing_plants(s,far_side,f,12,12)
    trailing_plants(s,far_front,.07,10,10)
    # A stepped stone channel wall runs from the right-hand bank down to the water.
    bank=[(538,222),(783,285),(783,394),(538,243)]
    blocks(s,bank,dark,14,5)
    stroke(s,bank,"#9ba78e",(0,0),(1,0),width=3)
    for x,y,w in [(674,302,14),(724,333,18),(582,254,9)]:
        s.line("#7f998c",(x,y),(x+w,y))
    near=[(-12,133),(146,149),(146,331),(-12,430)]
    left=[(146,149),(225,131),(225,273),(146,331)]
    blocks(s,left,shade,5,8);blocks(s,near,dark,7,9)
    ruin_border(s,subface(near,0,.11,1,.21),10)
    moss_seams(s,left,36);moss_seams(s,near,67)
    blocks(s,[(0,252),(168,235),(222,254),(77,313)],sun,9,3)
    # Sagging deck, two differently foreshortened handrails, and hand-knotted rope stays.
    # Each board spans the walk; there are real gaps between the irregular timbers.
    def deck(t, side):
        # side 0 is the distant edge of the planks, side 1 their near edge.
        ease=(1.38*t)/(1+.38*t)
        a=(149+76*side,237+25*side);b=(473+39*side,186+4*side)
        sag=29*4*ease*(1-ease)
        return (a[0]+(b[0]-a[0])*ease,a[1]+(b[1]-a[1])*ease+sag)
    def hand(t,side):
        x,y=deck(t,side);return (x,y-(43+5*side)*(1-t)-19*t+8*math.sin(t*math.pi))
    for side in [0,1]:
        s.line("#384d46",*[deck(j/40,side) for j in range(41)],width=3)
    s.line("#536557",*[hand(j/40,0) for j in range(41)],width=3)
    s.line("#a7a184",*[(x,y-1) for x,y in [hand(j/40,0) for j in range(41)]])
    for j in range(0,31,3):s.line("#787f68",hand(j/30,0),deck(j/30,0),width=2)
    for j in reversed(range(44)):
        t=j/44;u=(j+.91)/44
        a,b,c,d=deck(t,0),deck(u,0),deck(u,1),deck(t,1)
        s.poly(s.rng.choice(["#918a71","#a19879","#817e69","#a79c7c","#8c876e"]),a,b,c,d)
        s.line("#b5a98b",a,d)
        s.line("#5a6255",d,c,width=2)
        if j%4==1:
            s.line("#777764",((2*a[0]+d[0])/3,(2*a[1]+d[1])/3),
                   ((a[0]+d[0])/2,(a[1]+d[1])/2))
    for j in range(0,31,3):
        t=j/30; a=deck(t,1); b=hand(t,1)
        s.line("#5a6558",a,b,width=2)
        s.line("#aaa584",(a[0]+1,a[1]-1),(b[0]+1,b[1]))
        s.oval(b[0]-2,b[1]-1,4,3,"#b3a88a")
    s.line("#515e53",*[hand(j/48,1) for j in range(49)],width=3)
    s.line("#aaa488",*[(x,y-1) for x,y in [hand(j/48,1) for j in range(49)]])
    for side in [0,1]:
        for t in [0,1]:
            x,y=deck(t,side);xx,yy=hand(t,side);w=5 if t==0 else 3
            s.line("#5b6053",(x,y+2),(xx,yy-5),width=w)
            for q in [-2,0,2]:s.line("#ab9d7e",(xx-w*.6,yy+q),(xx+w*.6,yy+q+1))
    # Rain-polished blocks, overhanging vines and leafy silhouettes at the very margins.
    for x,y,w,h in [(0,86,125,66),(59,80,103,45),(93,111,62,25),(744,94,123,56),(782,58,138,59)]:
        s.foliage(x,y,w,h,("#445f55","#567363","#6f856d","#889478"),80)
    for x,y,h in [(8,105,54),(38,99,43),(81,105,30),(720,112,32),(755,99,56)]:
        s.wire((x,y),(x+2,y+h),4,"#546e5d",2)
        for j in range(6,h,8):s.poly("#748568",(x+1,y+j),(x+6,y+j-3),(x+3,y+j+4))
    for x,y in [(274,339),(312,357),(331,316),(363,292),(423,330),(484,285),(182,389),(494,387)]:
        s.draw.arc((x-5,y-1,x+6,y+2),0,320,fill="#a3b7a8")
    for j in range(75):
        x=s.rng.randrange(768);y=s.rng.randrange(109,430)
        s.line("#9da997" if j%6==0 else "#84968a",(x,y),(x-1,y+s.rng.randrange(2,6)))
    return s.image


def print_postcard(name, artwork):
    """Add a small number of ink values per colour, preserving the drawn silhouettes."""
    direction = {"dust-1999": .36, "dust-source": .67, "dust2": .49, "aztec": .45,
                 "inferno": .36, "nuke": .34, "train": .60, "office": .5}[name]
    seed=random.Random("utility-lab/ink/"+name)
    # A broad wash of warm light and cool shade gives the large plaster and stone
    # planes depth. A dither threshold keeps the microtexture on the native pixel grid.
    coarse=Image.new("L",(32,18))
    coarse.putdata([seed.randint(50,185) for _ in range(32*18)])
    coarse=coarse.resize(artwork.size,Image.Resampling.BICUBIC)
    coarse_values=coarse.tobytes()
    grit=Image.new("L",(WIDTH//3,HEIGHT//3))
    grit.putdata([seed.randrange(256) for _ in range(grit.width*grit.height)])
    grit_values=grit.resize(artwork.size,Image.Resampling.BILINEAR).tobytes()
    image=ImageEnhance.Color(artwork).enhance(1.21)
    image=ImageEnhance.Contrast(image).enhance(1.11)
    pixels=[]
    for y in range(HEIGHT):
        v=y/HEIGHT
        for x in range(WIDTH):
            r,g,b=image.getpixel((x,y))
            # A four-step ink scale, with scattered paper flecks in the architecture.
            index=y*WIDTH+x
            mottling=(coarse_values[index]-122)/12
            falloff=abs(x/WIDTH-direction)*6
            tooth=(grit_values[index]-128)/25
            light=3.8-falloff-2.5*v+mottling*(.55+.72*v)+tooth*(.22+.80*v)
            grain=seed.randrange(100)
            fleck=-3 if grain<5 else (3 if grain>95 else 0)
            ink=round(light/2)*2+fleck
            pixels.append((min(255,max(0,r+ink)),min(255,max(0,g+ink)),min(255,max(0,b+ink))))
    image.putdata(pixels)
    return image



def render(name, scene):
    stems = {"dust2": "dust2-16", "inferno": "inferno-source", "nuke": "nuke-source"}
    stem = stems.get(name, name)
    picture = print_postcard(name, scene())
    picture.save(ART / "maps" / f"{stem}.webp", lossless=True, method=6)
    thumb = picture.resize((96, 54), Image.Resampling.LANCZOS)
    thumb.save(ART / "map-thumbnails" / f"{stem}.webp", quality=90, method=6)


if __name__ == "__main__":
    import sys
    import industrial_map_scenes as industrial

    scenes = {"dust-1999": dust_1999, "dust-source": dust_source, "dust2": dust2, "aztec": aztec,
              "inferno": lambda: industrial.inferno(Scene), "nuke": lambda: industrial.nuke(Scene),
              "train": lambda: industrial.train(Scene), "office": lambda: industrial.office(Scene)}
    for scene_id in sys.argv[1:] or scenes:
        render(scene_id, scenes[scene_id])
