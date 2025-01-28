import ReactLoading from 'react-loading';
const ManualLoader = () => {
    return ( 
        <>
        <section>
        <ReactLoading className='w-2 h-2' type="spokes" color="#fff" />
        </section>
        </>
     );
}
 
export default ManualLoader;