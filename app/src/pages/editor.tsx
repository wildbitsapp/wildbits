import { createPeers, createProvider, createUser, Peers } from '@wildbits/collaboration'
import { EditorView, createEditor } from '@wildbits/editor'
import { createDoc, createLocator, createNotes, createState, getLocatorPath } from '@wildbits/model'
import { useParams, useLocation, useNavigate } from '@solidjs/router'
import { createEffect, on } from 'solid-js'

import { Workspace } from '../layout'
import { createPersistence } from '../signals'
import welcomeContent from '../welcome.html?raw'

export default function EditorPage() {
  const [notes, { createNote, createNoteIfNotExists, deleteNote, updateNoteTitle }] = createNotes()
  const [user] = createUser()
  const [state, setState] = createState()

  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const locator = () => createLocator(params.id, location.hash.slice(1))
  const doc = createDoc(() => params.id)
  const persistence = createPersistence(locator, doc)

  const provider = createProvider({
    locator,
    doc,
    // TODO: create a config provider with all the env vars in there
    signalingServer: import.meta.env.VITE_COLLABORATION_SIGNALING_SERVER,
  })

  const editor = createEditor({ provider })
  const peers = createPeers({ provider })

  // NOTE: For some reason this is called when notes change so make sure we only are
  // interested in `locator` changes
  createEffect(
    on(locator, () => {
      setState('locator', locator())
      createNoteIfNotExists(locator())
    })
  )

  createEffect(() => {
    editor().on('create', ({ editor }) => {
      editor.on('update', () => {
        updateNoteTitle(locator().id, editor.storage.metadata.title)
      })

      persistence().once('synced', () => {
        if (editor.isEmpty && state.pristine && locator().id === 'welcome') {
          editor.commands.setContent(welcomeContent)
          // XXX: The update event doesn't get triggered so we manually change
          // the title
          updateNoteTitle(locator().id, 'Welcome to Wildbits!')
        }

        setState('pristine', false)
      })
    })
  })

  createEffect(() => {
    editor().commands.updateUser(user())
  })

  const toggleMenu = () => {
    setState('menuVisible', menuVisible => !menuVisible)
  }

  const handleCreateNote = () => {
    const locator = createNote()
    navigate(getLocatorPath(locator))
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId)

    if (notes().length > 0) {
      navigate(notes()[notes().length - 1].path || '/')
    } else {
      navigate('/')
    }
  }

  return (
    <Workspace
      notes={notes()}
      menuVisible={state.menuVisible}
      onToggleMenu={toggleMenu}
      onCreateNote={handleCreateNote}
      onDeleteNote={handleDeleteNote}
    >
      <EditorView editor={editor} />
      <Peers peers={peers} />
    </Workspace>
  )
}
