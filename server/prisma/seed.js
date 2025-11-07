import { PrismaClient, FileType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const hymns = [
    {
      title: 'أصليله',
      tags: ['اجتماعات صلاه', 'تسليم', 'صلاة'],
      files: [
        { type: FileType.VIDEO_MONTAGE, fileUrl: 'blabla', duration: 289 },
        { type: FileType.MUSIC_AUDIO, fileUrl: 'blabla', duration: 289 },
        { type: FileType.POWERPOINT, fileUrl: 'blabla' },
        { type: FileType.WORD_DOCUMENT, fileUrl: 'blabla' }
      ]
    },
    {
      title: 'أعروس الفادى القبطية',
      tags: ['الكنيسة', 'النيروز'],
      files: [
        { type: FileType.VIDEO_MONTAGE, fileUrl: 'blabla', duration: 284 },
        { type: FileType.MUSIC_AUDIO, fileUrl: 'blabla', duration: 284 },
        { type: FileType.POWERPOINT, fileUrl: 'blabla' },
        { type: FileType.WORD_DOCUMENT, fileUrl: 'blabla' }
      ]
    },
    {
      title: 'احكى يا تاريخ',
      tags: ['النيروز'],
      files: [
        { type: FileType.VIDEO_MONTAGE, fileUrl: 'blabla', duration: 208 },
        { type: FileType.MUSIC_AUDIO, fileUrl: 'blabla', duration: 208 },
        { type: FileType.POWERPOINT, fileUrl: 'blabla' },
        { type: FileType.WORD_DOCUMENT, fileUrl: 'blabla' }
      ]
    },
    {
      title: 'احلى ما فى حياتى انت',
      tags: ['العشرة مع الله', 'جمال ربنا'],
      files: [
        { type: FileType.VIDEO_MONTAGE, fileUrl: 'blabla', duration: 199 },
        { type: FileType.MUSIC_AUDIO, fileUrl: 'blabla', duration: 199 },
        { type: FileType.POWERPOINT, fileUrl: 'blabla' },
        { type: FileType.WORD_DOCUMENT, fileUrl: 'blabla' }
      ]
    },
    {
      title: 'اختبرتنى الهى',
      tags: ['العشرة مع الله', 'محبة الله'],
      files: [
        { type: FileType.VIDEO_MONTAGE, fileUrl: 'blabla', duration: 253 },
        { type: FileType.MUSIC_AUDIO, fileUrl: 'blabla', duration: 253 },
        { type: FileType.POWERPOINT, fileUrl: 'blabla' },
        { type: FileType.WORD_DOCUMENT, fileUrl: 'blabla' }
      ]
    },
    {
      title: 'ارضى افرحى',
      tags: ['الميلاد'],
      files: [
        { type: FileType.VIDEO_MONTAGE, fileUrl: 'blabla', duration: 225 },
        { type: FileType.MUSIC_AUDIO, fileUrl: 'blabla', duration: 225 },
        { type: FileType.POWERPOINT, fileUrl: 'blabla' },
        { type: FileType.WORD_DOCUMENT, fileUrl: 'blabla' }
      ]
    }
  ];

  for (const hymn of hymns) {
    await prisma.hymn.create({
      data: {
        title: hymn.title,
        files: { create: hymn.files },
        tags: {
          connectOrCreate: hymn.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });
  }

  console.log('Sample hymns inserted successfully.');

  const sayings = [
    {
      author: 'القديس أغسطينوس',
      authorImage: 'https://example.com/augustine.jpg',
      source: 'العظة على الجبل',
      content: 'أحبب ثم افعل ما تشاء.',
      tags: ['المحبة', 'الحياة المسيحية']
    },
    {
      author: 'القديس أنطونيوس الكبير',
      authorImage: 'https://example.com/anthony.jpg',
      source: 'سيرته',
      content: 'من يعرف ذاته يعرف الله.',
      tags: ['الاتضاع', 'معرفة الله']
    },
    {
      author: 'القديس يوحنا ذهبي الفم',
      authorImage: 'https://example.com/john.jpg',
      source: 'عظات على إنجيل متى',
      content: 'لا تطلب ما للآخرين، بل اشكر الله على ما لك.',
      tags: ['الشكر', 'القناعة']
    }
  ];

  for (const saying of sayings) {
    await prisma.saying.create({
      data: {
        author: saying.author,
        authorImage: saying.authorImage,
        source: saying.source,
        content: saying.content,
        tags: {
          connectOrCreate: saying.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });
  }

  console.log('Sample sayings inserted successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
