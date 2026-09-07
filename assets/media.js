/* ==========================================================================
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   List your launch photos and videos here, in the order you want them shown.
   Filenames must match exactly what's in /Videos and /Photos (case-sensitive
   on Vercel — "Photo.JPG" and "photo.jpg" are different files).

   Three slide types:

     { type: 'image',   src, caption }
     { type: 'video',   src, poster, caption }     — self-hosted, keep under ~15 MB
     { type: 'youtube', id,  caption }             — for anything longer

   Every 'video' needs a 'poster' — a JPG still from the video. Without one the
   slide is a black rectangle until someone presses play. tools/optimize-media.sh
   generates posters for you.
   ========================================================================== */

window.LAUNCH_MEDIA = [

  {
    type: 'youtube',
    id: 'jvv_0czkVD0',
    caption: 'Full talk — The AI Product Manager Gita launch, RCM Bangalore'
  },

  {
    type: 'image',
    src: '/Photos/rcmb-stage.jpg',
    caption: 'On stage with Dr. S. R. Mandal, Chief Guest'
  },

  {
    type: 'video',
    src: '/Videos/signing.mp4',
    poster: '/Photos/poster-signing.jpg',
    caption: 'Book signing'
  },

  {
    type: 'image',
    src: '/Photos/rcmb-audience.jpg',
    caption: 'Students and faculty, RCM Bangalore'
  },

  {
    type: 'image',
    src: '/Photos/rcmb-signing.jpg',
    caption: 'Signing copies after the session'
  }

];
