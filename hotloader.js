import { URL } from 'url'

export const resolve = async (specifier, context, defaultResolve) => {
    const result = defaultResolve(specifier, context, defaultResolve);
    const child = new URL(result.url);

    if (child.protocol === 'nodejs:' || child.protocol === 'node:' || child.pathname.includes('/node_modules/')) return result;
    else return { url: child.href + '?id=' + Math.random().toString(36).substring(3) };
}