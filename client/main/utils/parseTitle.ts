// 获取分类和标题
export default function(content: string){
    const ret = {
        category: '',
        title: '新笔记',
    };

    if(!content) return ret;

    let firstLine = content.split('\n', 2)[0];
    if(!firstLine) return ret;
    const title = firstLine.replace(/#/g, '').trim();
    ret.title = title;
    const titlePart = title.split('\\', 2);
    if(titlePart.length > 1){
        ret.category = titlePart[0].replace(/^#*\s*/, '');
        ret.title = titlePart[1];
    }
    return ret;
}
