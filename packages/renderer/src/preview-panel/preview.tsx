import React from "react";
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkReact from 'remark-react'
import { defaultSchema } from 'hast-util-sanitize'
import './preview.css'
import { prependListener } from "process";
import 'github-markdown-css/github-markdown.css'
import { selectCharRight } from "@codemirror/commands";
import RemarkCode from "../code/remark-code";

interface Props {
  doc: string
}

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className']
  }
}

const Preview: React.FC<Props> = (props) => {
  const md = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkReact, {
      createElement: React.createElement,
      sanitize: schema,
      remarkReactComponents: {
        code: RemarkCode
      }
    })
    .processSync(props.doc).result
  // console.log(md)
  return <div className="preview markdown-body">{md}</div>
}

export default Preview
