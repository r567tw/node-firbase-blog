//分頁
const pagination = function (resource, currentPage) {

    const total = resource.length;
    const perPage = 5;
    const totalpage = Math.ceil(total / perPage)
    if (currentPage > totalpage) {
        currentPage = totalpage;
    }
    const minItem = currentPage * perPage - perPage + 1
    const maxItem = currentPage * perPage
    const data = [];
    resource.forEach(function (item, i) {
        let itemNum = i + 1;
        if (itemNum >= minItem && itemNum <= maxItem) {
            data.push(item)
        }
    });

    const page = {
        totalpage,
        currentPage,
        hasPre: currentPage > 1,
        hasNext: currentPage < totalpage
    }

    return {
        page,
        data
    }
}

module.exports = pagination;