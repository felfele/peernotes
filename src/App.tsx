import React, { useState, useEffect } from 'react';

import './App.css';
import LogoIcon from './logo.svg'
import { createRandomDocument, LocalDocument, createRandomShareId, Peer } from './document';
import { receiveHandshake, sendHandshake, HandshakeReader } from './handshake';
import { testStorageHandshake, testStorageReadWrite } from './storage-cli';

function InputForm(props: { addTodo: (s: string) => void, openSettings: () => void }) {
    const [value, setValue] = useState('')
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        props.addTodo(value)
        setValue('')
    }
    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'stretch',
                alignItems: 'center',
            }}
        >
            <input
                id='forminput'
                type='text'
                value={value}
                placeholder='New item here...'
                onChange={e => setValue(e.target.value)}
                style={{
                    flex: 1,
                    fontSize: 'large',
                }}
            />
        </form>
    )
}

function TodoItem(props: { text: string, index: number, deleteItem: (index: number) => void }) {
    return (
        <div
            className='todo'
        >
            <div style={{ display: 'flex' }}>{props.text}</div>
            <div style={{ display: 'flex' }}><button onClick={() => props.deleteItem(props.index)}>X</button></div>
        </div>
    )
}

function Logo(props: { onClick: () => void }) {
    return (
        <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'flex-end', height: 40 }}>
            <img src={LogoIcon} style={{ width: 40 }} onClick={props.onClick} alt='logo' />
        </div>
    )
}

const saveDocument = (localDocument: LocalDocument) => {
    console.log('saveDocument', {localDocument})
    localStorage.setItem(localDocument.documentId, JSON.stringify(localDocument))
}


const makeShareLink = (shareId: string) => {
    const originalLocationLink = window.location.href
    const hashPosition = originalLocationLink.indexOf('#')
    if (hashPosition === -1) {
        return originalLocationLink + '#' + shareId
    }
    return originalLocationLink.slice(0, hashPosition) + '#' + shareId
}

function Handshake(props: { localDocument: LocalDocument, onPeerReceived: (peer: Peer) => void }) {
    const [handshakeReader, setHandshakeReader] = useState<HandshakeReader | undefined>(undefined)
    useEffect(() => {
        let isHandshake = true;
        (async function handshake() {
            const reader = await sendHandshake(props.localDocument.shareId, props.localDocument.feedKeyPair.address)
            console.log('after receiveHandshake', { reader, handshakeReader })
            setHandshakeReader(reader)
            console.log('after setHandshakeReader', { reader, handshakeReader })
            // while (isHandshake) {
            //   const peer = await handshakeReader()
            //   if (peer != null) {
            //     props.onPeerReceived(peer)
            //   }
            // }
        })()
        return () => {
            isHandshake = false
        }
    }, [props])
    return handshakeReader == null
        ? null
        : <button onClick={async () => {
            console.log('read clicked')
            const peer = await handshakeReader.read()
            console.log('received peer', { peer })
            peer && props.onPeerReceived(peer)
        }}>Read!</button>
}

function App() {
    const appName = 'Peernotes'
    const [title, setTitle] = useState(appName)
    const [localDocument, setLocalDocument] = useState<LocalDocument>(createRandomDocument())
    const [showSharing, setShowSharing] = useState(false)
    const [handshakeReader, setHandshakeReader] = useState<HandshakeReader | undefined>(undefined)
    const shareLink = makeShareLink(localDocument.shareId)

    const updateLocalDocument = (doc: LocalDocument) => {
        setLocalDocument(doc)
        saveDocument(doc)
    }
    const setTodos = (todos: string[]) => {
        const newLocalDocument = {
            ...localDocument,
            todos,
        }
        setLocalDocument(newLocalDocument)
        if (newLocalDocument.todos !== localDocument.todos) {
            saveDocument(newLocalDocument)
        }
    }
    const onPeerReceived = (peer: Peer) => {
        const shareId = createRandomShareId()
        const updatedLocalDocument = {
            ...localDocument,
            shareId,
            peers: [...localDocument.peers, peer],
        }
        updateLocalDocument(updatedLocalDocument)
    }
    useEffect(() => {
        console.log('useEffect[]', window.location)
        if (window.location.hash === '') {
            saveDocument(localDocument)
            window.location.hash = '#' + localDocument.documentId
            console.log('create new document', {localDocument})
        } else {
            const docId = window.location.hash.replace('#', '')
            const docString = localStorage.getItem(docId)
            if (docString == null) {
                console.log('received document', {docId, localDocument});

                (async function handshake() {
                    const reader = await receiveHandshake(docId, localDocument.feedKeyPair.address)
                    console.log('after receiveHandshake', { reader, handshakeReader })
                    setHandshakeReader(reader)
                    // while (true) {
                    //   const peer = await handshakeReader()
                    //   if (peer != null) {
                    //     const updatedLocalDocument = {
                    //       ...localDocument,
                    //       peers: [...localDocument.peers, peer],
                    //     }
                    //     updateLocalDocument(updatedLocalDocument)
                    //     window.location.hash = '#' + updatedLocalDocument.shareId
                    //   }
                    // }
                })()
            } else {
                const doc = JSON.parse(docString) as LocalDocument
                setLocalDocument(doc)
                console.log('opening existing document', {doc});
            }
        }
    }, [])
    return (
        <div className="App">
            <header className="App-header">
                {showSharing
                    ?
                    <div className='todo-list'>
                        <Handshake localDocument={localDocument} onPeerReceived={onPeerReceived} />
                        {title}
                        <Logo onClick={() => setShowSharing(false)} />
                        <p>Share link</p>
                        <a href={shareLink}>{shareLink}</a>
                        <p>Peers {`(${localDocument.peers.length})`}</p>
                        {localDocument.peers.map(peer => <p key={`peer-${peer.address}`}>{peer.address}</p>)}
                        <button onClick={() => {
                            localStorage.clear()
                            window.location.hash = ''
                            window.location.reload()
                        }}>Clear localStorage</button>
                        <button onClick={() => testStorageReadWrite()}>Test</button>
                    </div>
                    :
                    <div className='todo-list'>
                        {title}
                        {handshakeReader && <button
                            onClick={async () => {
                                const peer = await handshakeReader.read()
                                console.log('received peer', { peer })
                                peer && onPeerReceived(peer)
                            }}
                        >Read!</button>
                        }
                        <Logo onClick={() => setShowSharing(true)} />
                        {localDocument.todos.map((todo, index) =>
                            <TodoItem
                                text={todo}
                                index={index}
                                deleteItem={index => {
                                    const todosCopy = [...localDocument.todos]
                                    todosCopy.splice(index, 1)
                                    setTodos(todosCopy)
                                }
                                }
                            />)}
                        <InputForm
                            addTodo={s => setTodos([...localDocument.todos, s])}
                            openSettings={() => {
                                console.log('openSettings')
                                setShowSharing(true)
                            }}
                        />
                    </div>
                }
            </header>
        </div>
    );
}

export default App;
