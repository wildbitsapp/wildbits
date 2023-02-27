import { createEditor, Editor as EditorClass } from '@mindraft/create-editor'
import { Editor } from '@mindraft/editor'
import { markdownExtension } from '@mindraft/editor-extension-markdown'
import {
  persistenceExtension,
  usePersistence,
} from '@mindraft/editor-extension-persistence'
import { createAtom } from '@mindraft/utils'
import { Presence } from '@motionone/solid'
import { createShortcut } from '@solid-primitives/keyboard'
import { createResource, Show } from 'solid-js'

import { Pane, Workspace } from './layout'

export function App() {
  const { loadDocument, saveDocument } = usePersistence()
  const editor = createEditor([
    markdownExtension(),
    persistenceExtension(saveDocument),
  ])
  const isSplit = createAtom(false)
  const [doc] = createResource('main', loadDocument)

  createShortcut(['Control', 'E'], () => {
    isSplit(prev => !prev)
  })

  return (
    <Workspace isSplit={isSplit()}>
      <Pane>
        <Editor doc={doc()!} editor={editor} />
      </Pane>
      <Presence exitBeforeEnter>
        <Show when={isSplit()}>
          <Pane>
            <div style={{ width: '100%', height: '100%' }} />
          </Pane>
        </Show>
      </Presence>
    </Workspace>
  )
}
