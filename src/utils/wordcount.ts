// A word counter for markdown contents
// A wrapper for '@wordpress/wordcount'

import { count } from '@wordpress/wordcount';

export default function (content: string): number {
  let cnContent: string = filterEn(content);
  let enContent: string = filterCn(content);

  return count(cnContent, 'characters_excluding_spaces', {}) +
    count(enContent, 'words', {});
}

function filterCn(content: string): string {
  return content.replace(/[\u4E00-\u9FA5]/g, ' ');
}

function filterEn(content: string): string {
  let res = content.match(/[\u4E00-\u9FA5]/g || []);
  if (res == null) return '';
  return res.join(' ');
}
