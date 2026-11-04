import { File, Directory, Paths } from 'expo-file-system';

// Camera / gallery photos live in a temporary cache that the phone can clear.
// This copies the photo into the app's permanent folder so it stays saved.
export function persistPhoto(uri) {
  try {
    if (uri.includes('/photos/')) return uri;
    const dir = new Directory(Paths.document, 'photos');
    if (!dir.exists) dir.create();
    const dest = new File(dir, 'job-' + Date.now() + '.jpg');
    new File(uri).copy(dest);
    return dest.uri;
  } catch (e) {
    console.log('Photo copy failed, using original:', e);
    return uri;
  }
}
