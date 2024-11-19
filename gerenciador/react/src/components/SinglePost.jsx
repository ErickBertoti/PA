import { UserIcon, TrashIcon, DownloadIcon } from '@heroicons/react/solid'

export default function SinglePost({ className, post, category, deletePostClicked, downloadFile }) {
  const { id, caption, imageUrl } = post

  return (
    <div className={`${className} outline-1 w-300`}>
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row items-center space-x-4 cursor-pointer active:opacity-80">
          <UserIcon className="cursor-pointer hover:text-gray-900 active:text-gray-700 h-10 w-10 text-gray-700" />
          <p className="text-sm">{category}</p>
        </div>
        <p className="text-xs">{caption}</p>
        <div className="flex flex-row items-end space-x-4 justify-center">
          <img className="rounded" width="150" height="200" src={imageUrl} />
          {/* Ações */}
          <div className="flex flex-col items-center">
            <TrashIcon className="cursor-pointer hover:text-gray-900 active:text-gray-700 h-10 w-10 text-gray-700" onClick={() => deletePostClicked({ id })} />
            <DownloadIcon className="cursor-pointer hover:text-gray-900 active:text-gray-700 h-10 w-10 text-gray-700" onClick={() => downloadFile({ id })} />
          </div>
        </div>
      </div>
    </div>
  )
}