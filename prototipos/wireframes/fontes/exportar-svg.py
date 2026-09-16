"""Exportação vetorial offline. Não utiliza navegador nem serviços externos."""
from pathlib import Path
from PIL import ImageFont
import json, html, re, math, subprocess

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'fontes/telas.json').read_text())
C=DATA['colors']
FONT_REG=subprocess.check_output(['fc-match','-f','%{file}','Arial']).decode()
FONT_BOLD=subprocess.check_output(['fc-match','-f','%{file}','Arial:style=Bold']).decode()
FONTS={}
def font(size,weight=400):
    key=(size,weight)
    if key not in FONTS:FONTS[key]=ImageFont.truetype(FONT_BOLD if weight>=600 else FONT_REG,round(size*4))
    return FONTS[key]
def length(txt,size,weight):return font(size,weight).getlength(txt)/4
def lines(txt,w,size=16,weight=400):
    result=[]
    for para in str(txt).split('\n'):
        line=''
        for word in para.split(' '):
            test=(line+' '+word).strip()
            if line and length(test,size,weight)>w:result.append(line);line=word
            else:line=test
        result.append(line)
    return result
def natural(n):
    typ=n['type']
    if n.get('width'):return n['width']
    if typ=='icon':return n['size']
    if typ=='text':return length(n['text'],n['size'],n['weight'])+2*n.get('pad',0)
    if typ=='button' and n['kind']=='icon':return 44
    if typ=='row':return sum(natural(c) for c in n['children'])+n.get('gap',12)*(len(n['children'])-1)+2*n.get('pad',0)
    return 100
def fixed(n):return n.get('fixed') or n.get('width') or n['type']=='icon' or n['type']=='button' and n['kind']=='icon'
def layout(n,w):
    n=dict(n);n['_w']=w;p=n.get('pad',0);typ=n['type']
    if typ=='text':
        n['_lines']=lines(n['text'],max(1,w-2*p),n['size'],n['weight']);h=len(n['_lines'])*n['size']*1.4+2*p
    elif typ=='icon':h=n['size']
    elif typ=='art':h=n['height']
    elif typ=='line':h=1
    elif typ=='button':
        size=13 if n.get('small') else 16;n['_size']=size;n['_lines']=lines(n['text'],max(1,w-28-(30 if n.get('icon') else 0)),size,600);h=max(44 if n.get('small') or n['kind']=='icon' else 52,len(n['_lines'])*size*1.3+(22 if n.get('small') else 26))
    elif typ in ('field','select'):
        n['_label']=lines(n['label'],w,14,600);n['_value']=lines(n.get('value') or n.get('placeholder') or 'Preencher',w-28-(24 if typ=='select' else 0),16,400);n['_inputh']=max(88 if n.get('multiline') else 52,28+len(n['_value'])*22.4);h=len(n['_label'])*19.6+8+n['_inputh']
    else:
        children=n['children'];gap=n.get('gap',12);inside=w-2*p;n['_children']=[]
        if typ=='col':
            h=2*p+gap*max(0,len(children)-1)
            for c in children:
                cw=natural(c) if fixed(c) else inside
                child=layout(c,min(inside,cw));child['_x']=p+(inside-child['_w'])/2 if n.get('align')=='center' else p;child['_y']=h-2*p-gap*max(0,len(children)-1) if False else 0;n['_children'].append(child)
            y=p
            for ch in n['_children']:ch['_y']=y;y+=ch['_h']+gap
            h=y-gap+p if children else 2*p
        else:
            fixed_total=sum(natural(c) for c in children if fixed(c));flex_count=sum(not fixed(c) for c in children);available=inside-gap*max(0,len(children)-1)-fixed_total
            widths=[natural(c) if fixed(c) else max(20,available/max(1,flex_count)) for c in children]
            for c,cw in zip(children,widths):n['_children'].append(layout(c,cw))
            h=max((c['_h'] for c in n['_children']),default=0)+2*p;x=p
            for ch in n['_children']:
                ch['_x']=x;ch['_y']=p+(h-2*p-ch['_h'])/2 if n.get('align','center')=='center' else p
                if n.get('align')=='stretch':ch['_h']=h-2*p
                x+=ch['_w']+gap
    n['_h']=h;return n
def esc(s):return html.escape(str(s),quote=True)
def rect(x,y,w,h,fill='none',radius=0,stroke=None):return f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{max(0,h):.2f}" rx="{radius}" fill="{fill}"'+(f' stroke="{stroke}"' if stroke else '')+'/>'
def text(txt,x,y,size=16,weight=400,color='ink',anchor='start'):
    return f'<text x="{x:.2f}" y="{y+size*.99:.2f}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" font-weight="{weight}" fill="{C.get(color,color)}" text-anchor="{anchor}">{esc(txt)}</text>'
def icon(key,x,y,size=24,color='plum'):
    raw=DATA['icons'].get(key,DATA['icons']['paw']);inner=re.sub(r'^<svg[^>]*>|</svg>$','',raw);color=C.get(color,color)
    return f'<g transform="translate({x:.2f} {y:.2f}) scale({size/24:.5f})" fill="{color if key=="paw" else "none"}" stroke="{color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">{inner}</g>'
def draw(n,x,y):
    out=[];w=n['_w'];h=n['_h'];typ=n['type'];p=n.get('pad',0)
    if n.get('bg') or n.get('border'):out.append(rect(x,y,w,h,C.get(n.get('bg'),'none'),n.get('radius',0),C.get(n.get('border'))))
    if typ=='text':
        for i,line in enumerate(n['_lines']):out.append(text(line,x+p,y+p+i*n['size']*1.4,n['size'],n['weight'],n.get('color','ink')))
    elif typ=='icon':out.append(icon(n['key'],x,y,n['size'],n['color']))
    elif typ=='art':
        out=[rect(x,y,w,h,C[n['bg']],16)];size=min(h*.42,72);iy=y+(h-size-(28 if n.get('label') else 0))/2;out.append(icon(n['key'],x+(w-size)/2,iy,size,n.get('color','plum')))
        if n.get('label'):out.append(text(n['label'],x+w/2,iy+size+12,12,600,n.get('color','plum'),'middle'))
    elif typ=='line':out.append(rect(x,y,w,1,C['line']))
    elif typ=='button':
        kind=n['kind'];bg=C['plum'] if kind=='primary' else C['lilac'] if kind=='secondary' else C['white'] if kind=='search' else C['surface'];color='white' if kind=='primary' else 'plum' if kind=='secondary' else 'ink'
        out.append(rect(x,y,w,h,bg,14,C['line'] if kind in ['chip','icon','search'] else None));size=n['_size'];offset=13 if n.get('icon') else 0;txty=y+(h-len(n['_lines'])*size*1.3)/2
        if n.get('icon'):out.append(icon(n['icon'],x+max(14,(w-length(n['text'],size,600)-30)/2),y+(h-21)/2,21,color))
        for i,line in enumerate(n['_lines']):out.append(text(line,x+w/2+offset,txty+i*size*1.3,size,600,color,'middle'))
    elif typ in ('field','select'):
        for i,line in enumerate(n['_label']):out.append(text(line,x,y+i*19.6,14,600))
        iy=y+len(n['_label'])*19.6+8;out.append(rect(x,iy,w,n['_inputh'],C['white'],12,C['line']))
        for i,line in enumerate(n['_value']):out.append(text(line,x+14,iy+14+i*22.4,16,400,'ink' if n.get('value') else 'muted'))
        if typ=='select':out.append(icon('chevron',x+w-31,iy+17,18,'muted'))
    else:
        for child in n['_children']:out.append(draw(child,x+child['_x'],y+child['_y']))
    return ''.join(out)
def screen_svg(item,index,width=430):
    sc=item['screen'];w=width;h=932;inner=w-40;out=[rect(0,0,w,h,C['white'],28)]
    out += [text('9:41',27,18,12,600),rect(w/2-55,12,110,27,C['ink'],16),text('••• ▰',w-68,18,12,600)]
    if sc['back']:out+=[rect(20,58,44,44,C['white'],14,C['line']),icon('arrow',32,70,20,'ink')]
    hx=74 if sc['back'] else 20
    if sc['title']=='PetZona':out+=[icon('paw',hx,66,29),text('Pet',hx+36,60,27,700),text('Zona',hx+77,60,27,700,'plum')]
    else:
        titlelines=lines(sc['title'],w-hx-78,19,700);ty=80-len(titlelines)*13.3
        for i,line in enumerate(titlelines):out.append(text(line,hx,ty+i*26.6,19,700))
    if sc['id']!='login':out+=[rect(w-64,58,44,44,C['white'],14,C['line']),icon('cart',w-53,69,21)]
    navh=78 if sc['nav'] else 0
    footer=layout({'type':'col','children':sc['footer'],'gap':8,'pad':0},inner) if sc['footer'] else None
    fh=(footer['_h']+24) if footer else 0
    bodyend=h-22-navh-fh
    out.append(f'<defs><clipPath id="bodyclip{index}">{rect(0,112,w,bodyend-112)}</clipPath></defs><g clip-path="url(#bodyclip{index})">')
    body=layout({'type':'col','children':sc['body'],'gap':20,'pad':0},inner);out.append(draw(body,20,128));out.append('</g>')
    if footer:out+=[rect(0,bodyend,w,fh,C['white']),draw(footer,20,bodyend+12)]
    if sc['nav']:
        yy=h-22-navh;out+=[rect(0,yy,w,navh,C['white']),rect(0,yy,w,1,C['line'])];slot=(w-40)/3
        for j,(route,ic,label) in enumerate([('home','home','Início'),('products','bag','Produtos'),('services','paw','Serviços')]):
            xx=20+j*slot;active=sc['active']==route
            if active:out.append(rect(xx,yy+10,slot-8,56,C['lilac'],12))
            out+=[icon(ic,xx+(slot-8)/2-11,yy+16,22,'plum' if active else 'muted'),text(label,xx+(slot-8)/2,yy+43,11,600 if active else 400,'plum' if active else 'muted','middle')]
    out+=[rect(0,h-22,w,22,C['white']),rect(w/2-66,h-13,132,4,C['ink'],3)]
    return ''.join(out),{'screen':item['name'],'width':w,'height':h,'contentHeight':round(body['_h']+40),'viewportHeight':round(bodyend-112),'scrolls':body['_h']+40>bodyend-112}

(ROOT/'telas-svg').mkdir(exist_ok=True)
metrics=[];overview=[]
for index,item in enumerate(DATA['screens']):
    content,meta=screen_svg(item,index);metrics.append(meta)
    slug=f'{index:02d}-{item["screen"]["id"]}-{item["service"]}.svg'
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="430" height="932" viewBox="0 0 430 932"><title>{esc(item["name"])}</title>{content}</svg>'
    (ROOT/'telas-svg'/slug).write_text(svg)
    if index<11:
        x=40+(index%4)*470;y=160+(index//4)*1020
        overview.append(text(item['name'],x,y-35,18,700))
        overview.append(f'<g transform="translate({x} {y})">{content}</g>')
ow,oh=1920,3240
board=f'<svg xmlns="http://www.w3.org/2000/svg" width="{ow}" height="{oh}" viewBox="0 0 {ow} {oh}">'+rect(0,0,ow,oh,C['baby'])+text('PetZona  /  Wireframes',40,34,40,700)+text('iPhone 16 Plus · 430 × 932  |  Azul bebê + ameixa + lilás',42,95,19,400,'muted')+''.join(overview)+text('Workshop da Fábrica de Software 2026.1 · Protótipo acadêmico · Dados ilustrativos',42,3190,18,400,'muted')+'</svg>'
(ROOT/'Petzona-visao-geral.svg').write_text(board)
for width in [360,390,768]:
    for index,item in enumerate(DATA['screens']):_,meta=screen_svg(item,index,width);metrics.append(meta)
(ROOT/'fontes/medidas.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2))
print('18 SVGs + visão geral gerados; composição calculada em 360, 390, 430 e 768 px.')
