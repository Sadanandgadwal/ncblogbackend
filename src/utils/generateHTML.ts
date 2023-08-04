export const generateHTML = async (content: any) => {
    if (content.heading) {
        return `<h1 style="font-weight:${content.bold ? "bold" : "normal"};
        text-decoration:${content.underline ? "underline" : "none"};
        font-style:${content.italic ? "italic" : "normal"};">${content.text
            }</h1>`;
    } else if (content.paragraph) {
        return `<p style="font-weight:${content.bold ? "bold" : "normal"};
    text-decoration:${content.underline ? "underline" : "none"};
    font-style:${content.italic ? "italic" : "normal"};">${content.text}</p>`;
    } else if (content.image) {
        return `<img src=${content.url} alt="img" />`;
    } else if (content.span) {
        return `<span style="font-weight:${content.bold ? "bold" : "normal"};
    text-decoration:${content.underline ? "underline" : "none"};
    font-style:${content.italic ? "italic" : "normal"};">${content.text
            }</span>`;
    }
    return `<br/>`;
};
