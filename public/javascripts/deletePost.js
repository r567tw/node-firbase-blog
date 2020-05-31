$(document).ready(funciton(){
    $('.deletePost').on('click', function (e) {
        e.preventDefault();
        var id = $(this).data('id')
        var title = $(this).data('title')
        console.log(id, title)
        // alert('dd');
    });
});