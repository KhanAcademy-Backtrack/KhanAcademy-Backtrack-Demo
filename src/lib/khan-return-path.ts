/** Bounded local lesson destinations only: no query, fragment, traversal or external URL. */
export function isLessonReturnPath(path:string){
 return path.length<=180&&/^\/learn\/topic\/(?:outline-(?:upcat|dcat)|college)-[a-z0-9_]+(?:-[a-z0-9]+)*$/.test(path);
}
