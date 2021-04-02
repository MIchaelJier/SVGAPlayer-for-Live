/* eslint-disable no-undef */
import pkg from '../package.json'
export default class DB {
  private storeName: string
  private dbPromise: Promise<IDBDatabase>

  constructor(
    { name, version, storeName } = {
      name: 'SVGA.DB',
      // eslint-disable-next-line radix
      version: parseInt(pkg.version),
      storeName: 'svga_file',
    }
  ) {
    this.storeName = storeName
    this.dbPromise = new Promise<IDBDatabase>(function (resolve, reject) {
      if (window.indexedDB) {
        const request = window.indexedDB.open(name, version) as IDBOpenDBRequest

        request.onerror = function (err) {
          reject(new Error('[SVGA.Lite.DB] indexedDB open fail' + err))
        }

        request.onsuccess = function () {
          resolve(request.result)
        }

        request.onupgradeneeded = function () {
          const db = request.result
          db.createObjectStore(storeName)
        }
      } else {
        throw new Error('[SVGA.Lite.DB] indexedDB not supported')
      }
    })
  }

  find(id: IDBValidKey): any {
    return this.dbPromise.then(
      (db) =>
        new Promise((resolve) => {
          const tx = db.transaction([this.storeName], 'readonly')
          const req = tx.objectStore(this.storeName).get(id)
          req.onsuccess = () => resolve(req.result)
        })
    )
  }

  insert(id: IDBValidKey, data: any): any {
    return this.dbPromise.then(
      (db) =>
        new Promise((resolve) => {
          const tx = db.transaction([this.storeName], 'readwrite')
          tx.objectStore(this.storeName).put(data, id)
          tx.oncomplete = resolve
        })
    )
  }

  delete(id: IDBValidKey): any {
    return this.dbPromise.then(
      (db) =>
        new Promise((resolve) => {
          const tx = db.transaction([this.storeName], 'readwrite')
          const req = tx.objectStore(this.storeName).delete(id)
          req.onsuccess = resolve
        })
    )
  }
}
