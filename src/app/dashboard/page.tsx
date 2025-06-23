import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className='flex flex-col mt-8 items-center'>
      <Image
        src='/images/404.jpg'
        alt='404 Error'
        width={500}
        height={300}
        className='mb-4'
      />
    </div>
  );
}