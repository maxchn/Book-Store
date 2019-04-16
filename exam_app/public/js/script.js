$(document).ready(function () {

    // Author Action Start

    function validateAuthorForm(e) {
        let hasError = false;
        let fullname = $('#fullname').val();

        if (!fullname || fullname.trim().length <= 0) {
            $('#fullname').addClass('is-invalid');
            hasError = true;
            e.preventDefault();
        } else {
            $('#question_text').removeClass('is-invalid');
        }

        return hasError;
    }

    $('#createAuthor').submit((e) => {
        if (!validateAuthorForm(e)) {
            e.preventDefault();

            let fullname = $('#fullname').val();
            $.ajax({
                type: 'POST',
                url: '/author/create',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    fullname: fullname
                }),
                success: function (data) {
                    window.location = '/author/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('#updateAuthor').submit((e) => {
        if (!validateAuthorForm(e)) {
            e.preventDefault();

            let id = $('#authorId').val();
            let fullname = $('#fullname').val();
            $.ajax({
                type: 'POST',
                url: '/author/update',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    id: id,
                    fullname: fullname
                }),
                success: function (data) {
                    window.location = '/author/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('.removeAuthorBtn').click((e) => {
        if (!confirm('Are you sure you want to delete the item?')) {
            e.preventDefault();
        }
    });

    // Author Action End

    // Publisher Action Start

    function validatePublisherForm(e) {
        let hasError = false;
        let name = $('#publisher_name').val();
        let country = $('#publisher_country').val();
        let state = $('#publisher_state').val();
        let city = $('#publisher_city').val();
        let street = $('#publisher_street').val();

        if (!name || name.trim().length <= 0) {
            $('#publisher_name').addClass('is-invalid');
            hasError = true;
        } else {
            $('#publisher_name').removeClass('is-invalid');
        }

        if (!country || country.trim().length <= 0) {
            $('#publisher_country').addClass('is-invalid');
            hasError = true;
        } else {
            $('#publisher_country').removeClass('is-invalid');
        }

        if (!state || state.trim().length <= 0) {
            $('#publisher_state').addClass('is-invalid');
            hasError = true;
        } else {
            $('#publisher_state').removeClass('is-invalid');
        }

        if (!city || city.trim().length <= 0) {
            $('#publisher_city').addClass('is-invalid');
            hasError = true;
        } else {
            $('#publisher_city').removeClass('is-invalid');
        }

        if (!street || street.trim().length <= 0) {
            $('#publisher_street').addClass('is-invalid');
            hasError = true;
        } else {
            $('#publisher_street').removeClass('is-invalid');
        }

        $.each($('input.phone-field'), (inx, val) => {
            let value = $(val).val();

            if (!value) {
                $(val).addClass('is-invalid');
                hasError = true;
            } else {
                $(val).removeClass('is-invalid');
            }
        });

        if (hasError) {
            e.preventDefault();
        }

        return hasError;
    }

    $('#createPublisher').submit((e) => {
        if (!validatePublisherForm(e)) {
            e.preventDefault();

            let name = $('#publisher_name').val();
            let country = $('#publisher_country').val();
            let state = $('#publisher_state').val();
            let city = $('#publisher_city').val();
            let street = $('#publisher_street').val();
            let phones = [];

            $.each($('input.phone-field'), (inx, val) => {
                let value = $(val).val();
                phones.push(value);
            });

            $.ajax({
                type: 'POST',
                url: '/publisher/create',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    name: name,
                    country: country,
                    state: state,
                    city: city,
                    street: street,
                    phones: phones
                }),
                success: function (data) {
                    window.location = '/publisher/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('#updatePublisher').submit((e) => {
        if (!validatePublisherForm(e)) {
            e.preventDefault();

            let id = $('#publisher_id').val();
            let name = $('#publisher_name').val();
            let address_id = $('#address_id').val();
            let country = $('#publisher_country').val();
            let state = $('#publisher_state').val();
            let city = $('#publisher_city').val();
            let street = $('#publisher_street').val();
            let phones = [];

            $.each($('input.phone-field'), (inx, val) => {
                let value = $(val).val();
                phones.push(value);
            });

            $.ajax({
                type: 'POST',
                url: '/publisher/update',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    id: id,
                    name: name,
                    country: country,
                    state: state,
                    city: city,
                    street: street,
                    address_id: address_id,
                    phones: phones
                }),
                success: function (data) {
                    window.location = '/publisher/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('.removePublisherBtn').click((e) => {
        if (!confirm('Are you sure you want to delete the item?')) {
            e.preventDefault();
        }
    });

    $('#addPhone').click((e) => {
        createPhoneContainer();
    });

    function createPhoneContainer() {
        let container = $('<div>');

        let label = $('<label>');
        label.text('Phone:');
        label.appendTo(container);

        let span = $('<span>');
        span.addClass('text-danger');
        span.text('*');
        span.appendTo(container);

        let input = $('<input>');
        input.attr('type', 'tel');
        input.attr('name', 'phones');
        input.attr('placeholder', 'Enter phone number');
        //input.attr('pattern', '/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g');
        input.attr('autofocus', '');
        input.addClass('form-control phone-field');
        input.appendTo(container);

        let errorContainer = $('<div>');
        errorContainer.addClass('invalid-feedback');
        errorContainer.text('Field is required');
        errorContainer.appendTo(container);

        let buttonsContainer = $('<div>');
        buttonsContainer.addClass('text-right');
        buttonsContainer.appendTo(container);

        let removeBtn = $('<button>');
        removeBtn.addClass('btn btn-danger text-right mt-2 mb-3');
        removeBtn.text('Remove');
        removeBtn.appendTo(buttonsContainer);

        $(removeBtn).click((e) => {
            e.preventDefault();

            $(e.target).parent().parent().remove();
        });

        container.appendTo($('#publisherPhonesContainer'));

        return input;
    }

    if ($('#updatePublisher').length > 0) {
        let publisher_id = $('#publisher_id').val();

        $.ajax({
            type: 'GET',
            url: `/publisher/get_phones/${publisher_id}`,
            contentType: 'application/json',
            success: function (data) {
                if (data) {
                    $.each(data, (idx, val) => {
                        let elem = createPhoneContainer();
                        $(elem).val(val.phone_number);
                    });
                }
            }
        });
    }

    // Publisher Action End

    // Category Action Start

    function validateCategoryForm(e) {
        let hasError = false;
        let name = $('#category_name').val();
        let parent = $('#category_parent').val();

        if (!name || name.trim().length <= 0) {
            $('#category_name').addClass('is-invalid');
            hasError = true;
        } else {
            $('#category_name').removeClass('is-invalid');
        }

        if (!parent) {
            $('#category_parent').addClass('is-invalid');
            hasError = true;
        } else {
            $('#category_parent').removeClass('is-invalid');
        }

        if (hasError) {
            e.preventDefault();
        }

        return hasError;
    }

    $('#createCategory').submit((e) => {
        if (!validateCategoryForm(e)) {
            e.preventDefault();

            let name = $('#category_name').val();
            let parent = $('#category_parent').val();

            $.ajax({
                type: 'POST',
                url: '/category/create',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    name: name,
                    parent: parent
                }),
                success: function (data) {
                    window.location = '/category/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('#updateCategory').submit((e) => {
        if (!validateCategoryForm(e)) {
            e.preventDefault();

            let id = $('#categoryId').val();
            let name = $('#category_name').val();
            let parent = $('#category_parent').val();

            $.ajax({
                type: 'POST',
                url: '/category/update',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    id: id,
                    name: name,
                    parent: parent
                }),
                success: function (data) {
                    window.location = '/category/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('.removeCategoryBtn').click((e) => {
        if (!confirm('Are you sure you want to delete the item?')) {
            e.preventDefault();
        }
    });

    function setCategoryParent() {
        let parent_id = $('#parent_category_id').val();

        if (parent_id) {
            $.each($('#category_parent option'), function (index, value) {
                if ($(this).val() == parent_id) {
                    $(this).attr('selected', '');
                    return;
                }
            });
        }
    }

    setCategoryParent();

    // Category Action End

    // Book Action Start

    function validateBookForm(e) {
        let hasError = false;

        let name = $('#book_name').val();
        let shortDescription = $('#book_short_description').val();
        let desciption = $('#book_description').val();
        let yearOfPublishing = $('#year_of_publishing').val();
        let pages = $('#pages').val();
        let isbn = $('#isbn').val();
        let price = $('#price').val();
        let category = $('#category').val();
        let publisher = $('#publisher').val();

        if (!name || name.trim().length <= 0) {
            $('#book_name').addClass('is-invalid');
            hasError = true;
        } else {
            $('#book_name').removeClass('is-invalid');
        }

        if (!shortDescription || shortDescription.trim().length <= 0) {
            $('#book_short_description').addClass('is-invalid');
            hasError = true;
        } else {
            $('#book_short_description').removeClass('is-invalid');
        }

        if (!desciption || desciption.trim().length <= 0) {
            $('#book_description').addClass('is-invalid');
            hasError = true;
        } else {
            $('#book_description').removeClass('is-invalid');
        }

        if (!yearOfPublishing || yearOfPublishing < new Date().getFullYear() - 200 || yearOfPublishing > new Date().getFullYear() + 1) {
            $('#year_of_publishing').addClass('is-invalid');
            hasError = true;
        } else {
            $('#year_of_publishing').removeClass('is-invalid');
        }

        if (!pages || pages <= 0 || pages > 100000) {
            $('#pages').addClass('is-invalid');
            hasError = true;
        } else {
            $('#pages').removeClass('is-invalid');
        }

        if (!isbn || !/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/gm.test(isbn)) {
            $('#isbn').addClass('is-invalid');
            hasError = true;
        } else {
            $('#isbn').removeClass('is-invalid');
        }

        if (!price || price <= 0) {
            $('#price').addClass('is-invalid');
            hasError = true;
        } else {
            $('#price').removeClass('is-invalid');
        }

        if (!category) {
            $('#category').addClass('is-invalid');
            hasError = true;
        } else {
            $('#category').removeClass('is-invalid');
        }

        if (!publisher) {
            $('#publisher').addClass('is-invalid');
            hasError = true;
        } else {
            $('#publisher').removeClass('is-invalid');
        }

        $.each($('input.author-field'), (idx, val) => {
            let value = $(val).val();

            if (!value) {
                $(val).addClass('is-invalid');
                hasError = true;
            } else {
                $(val).removeClass('is-invalid');
            }
        });

        $.each($('.new-author-field'), (idx, val) => {
            let value = $(val).val();

            if (!value || !value.trim()) {
                $(val).addClass('is-invalid');
                hasError = true;
            } else {
                $(val).removeClass('is-invalid');
            }
        });

        $.each($('select[name=authors]'), (idx, val) => {
            let value = $(val).val();

            if (!value || value == -1) {
                $(val).addClass('is-invalid');
                hasError = true;
            } else {
                $(val).removeClass('is-invalid');
            }
        });

        if (hasError) {
            e.preventDefault();
        }

        return hasError;
    }

    $('#createBook').submit((e) => {
        if (!validateBookForm(e)) {
            e.preventDefault();

            $.ajax({
                type: 'POST',
                url: '/book/create',
                data: loadBookData(),
                processData: false,
                contentType: false,
                success: function (data) {
                    window.location = '/book/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    function loadBookData() {
        let name = $('#book_name').val();
        let shortDescription = $('#book_short_description').val();
        let desciption = $('#book_description').val();
        let yearOfPublishing = $('#year_of_publishing').val();
        let pages = $('#pages').val();
        let isbn = $('#isbn').val();
        let price = $('#price').val();
        let category = $('#category').val();
        let publisher = $('#publisher').val();
        let author = $('#author').val();

        var formData = new FormData();
        formData.append('name', name);
        formData.append('short_description', shortDescription);
        formData.append('description', desciption);
        formData.append('year_of_publishing', yearOfPublishing);
        formData.append('pages', pages);
        formData.append('isbn', isbn);
        formData.append('price', price);
        formData.append('publisher', publisher);
        formData.append('category', category);
        formData.append('authors', author);

        $.each($('.author-field'), (idx, val) => {
            let value = $(val).val();
            formData.append('authors', value);
        });

        $.each($('input.file-field'), (idx, val) => {
            let file = $(val).prop('files')[0];
            formData.append('files', file);
        });

        $.each($('.new-author-field'), (idx, val) => {
            let value = $(val).val();
            formData.append('new_authors', value);
        });

        return formData;
    }

    $('#updateBook').submit((e) => {
        if (!validateBookForm(e)) {
            e.preventDefault();

            let data = loadBookData();
            data.append('id', $('#book_id').val());

            $.ajax({
                type: 'POST',
                url: '/book/update',
                data: data,
                processData: false,
                contentType: false,
                success: function (data) {
                    window.location = '/book/index';
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    toastr.error(jqXHR.responseText);
                }
            });
        }
    });

    $('.removeBookBtn').click((e) => {
        if (!confirm('Are you sure you want to delete the item?')) {
            e.preventDefault();
        }
    });

    if ($('#year_of_publishing').length > 0) {
        let minYear = new Date().getFullYear() - 200;
        let maxYear = new Date().getFullYear() + 1;

        for (let i = maxYear; i >= minYear; i--) {
            $('<option>').val(i).text(i).appendTo($('#year_of_publishing'));
        }
    }

    $('#addAuthorBtn').click((e) => {
        e.preventDefault();

        createAuthorContainer();
    });

    $('#addFilesBtn').click((e) => {
        e.preventDefault();

        createFileContainer();

        $(".file-field").change(function () {
            readURL(this);
        });
    });

    $('#author').change(changeAuthor);

    function changeAuthor(e) {
        if (e.target.value == 0) {
            let newAuthorContainer = $('<div>');
            newAuthorContainer.addClass('new_author_container');

            let input = $('<input>');
            input.addClass('form-control new-author-field mt-2');
            input.attr('type', 'text');
            input.attr('placeholder', 'Enter Full Name Author');
            input.appendTo(newAuthorContainer);

            let errorContainer = $('<div>');
            errorContainer.addClass('invalid-feedback');
            errorContainer.text('Field is required');
            errorContainer.appendTo(newAuthorContainer);

            newAuthorContainer.insertAfter(e.target);
        } else {
            $(e.target).parent().children('div.new_author_container').remove();
        }
    }

    function readURL(input) {
        $(input).parent().children('img').remove();

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                createImageContainer(input, e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    function createImageContainer(input, value) {
        let img = $('<img>');
        img.addClass('img-thumbnail rounded mt-2');
        img.attr('src', value);

        img.insertAfter($(input));
    }

    function createFileContainer() {
        let main_container = $('<div>');
        main_container.addClass('form-group');

        let label = $('<label>');
        label.attr('for', 'author');
        label.text('File:');
        label.appendTo(main_container);

        let span = $('<span>');
        span.addClass('text-danger');
        span.text('*');
        span.appendTo(main_container);

        let input = $('<input>');
        input.addClass('form-control file-field');
        input.attr('name', 'files');
        input.attr('type', 'file');
        input.attr('accept', 'image/*');
        input.appendTo(main_container);

        let buttonsContainer = $('<div>');
        buttonsContainer.addClass('text-right');
        buttonsContainer.appendTo(main_container);

        let removeBtn = $('<button>');
        removeBtn.addClass('btn btn-danger mt-2 text-right');
        removeBtn.text('Remove');
        removeBtn.appendTo(buttonsContainer);

        $(removeBtn).click((e) => {
            e.preventDefault();

            $(e.target).parent().parent().remove();
        });

        main_container.appendTo($('#files-container'));

        return input;
    }

    function createAuthorContainer() {
        let main_container = $('<div>');
        main_container.addClass('form-group');

        let label = $('<label>');
        label.attr('for', 'author');
        label.text('Author:');
        label.appendTo(main_container);

        let span = $('<span>');
        span.addClass('text-danger');
        span.text('*');
        span.appendTo(main_container);

        let select = $('<select>');
        select.addClass('form-control author-field');
        select.attr('name', 'authors');
        select.appendTo(main_container);

        $(select).change(changeAuthor);

        $.each($('#author option'), function (index, value) {
            let option = $('<option>');
            option.val($(this).val());
            option.text($(this).text());
            option.appendTo(select);
        });

        let buttonsContainer = $('<div>');
        buttonsContainer.addClass('text-right');
        buttonsContainer.appendTo(main_container);

        let removeBtn = $('<button>');
        removeBtn.addClass('btn btn-danger mt-2 text-right');
        removeBtn.text('Remove');
        removeBtn.appendTo(buttonsContainer);

        $(removeBtn).click((e) => {
            e.preventDefault();

            $(e.target).parent().parent().remove();
        });

        main_container.appendTo($('#authors-container'));

        return select;
    }

    if ($('#updateBook').length > 0) {
        let bookId = $('#book_id').val();

        $.ajax({
            type: 'GET',
            url: `/book/${bookId}`,
            contentType: 'application/json',
            success: function (data) {
                if (data) {
                    $('#book_name').val(data.name);
                    $('#book_short_description').val(data.short_description);
                    $('#book_description').val(data.description);
                    $('#year_of_publishing').val(data.year_of_publishing);
                    $('#pages').val(data.pages);
                    $('#isbn').val(data.isbn);
                    $('#price').val(data.price);
                    $('#category').val(data.category_id);
                    $('#publisher').val(data.publisher_id);

                    if (data.authors && data.authors.length > 0) {
                        $('#author').val(data.authors[0].id);

                        for (let i = 1; i < data.authors.length; i++) {
                            let select = createAuthorContainer();
                            $(select).val(data.authors[i].id);
                        }
                    }

                    if (data.photos) {
                        $.each(data.photos, (idx, val) => {
                            let input = createFileContainer();

                            createImageContainer(input, '/uploads/' + val.name);

                            let photo_id_input = $('<input>');
                            photo_id_input.attr('type', 'hidden');
                            photo_id_input.attr('name', 'files_ids');
                            photo_id_input.val(val.id);
                            photo_id_input.insertBefore(input);
                        });
                    }
                }
            },
            error: function () {
                window.location = '/book/index';
            }
        });
    }

    // Book Action End   

    // Index Action Start

    if ($('#menu-categories').length > 0) {
        $.ajax({
            type: 'GET',
            url: '/category/get_all',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {

                if (data) {
                    $.each(data, (idx, val) => {
                        let li = $('<li>');

                        let link = $('<a>');
                        link.attr('href', `/?category=${val.id}`);
                        link.text(val.full_name);
                        link.appendTo(li);

                        li.appendTo($('#menu-categories'));
                    });
                }
            }
        });
    }

    if ($('#menu-authors').length > 0) {
        $.ajax({
            type: 'GET',
            url: '/author/get_all',
            contentType: 'application/json; charset=utf-8',
            success: function (data) {

                if (data) {
                    $.each(data, (idx, val) => {
                        let li = $('<li>');

                        let link = $('<a>');
                        link.attr('href', `/?author=${val.id}`);
                        link.text(val.full_name);
                        link.appendTo(li);

                        li.appendTo($('#menu-authors'));
                    });
                }
            }
        });
    }

    if ($('#books-container').length > 0) {
        let queryParams = '';
        let index = -1;
        if ((index = window.location.href.indexOf('?')) != -1) {
            queryParams = window.location.href.substr(index, window.location.href.length - index);
        }

        $.ajax({
            type: 'GET',
            url: '/book/' + queryParams,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {

                if (data) {
                    $('#books_count').text(data.length);

                    $.each(data, (idx, val) => {

                        let main_container = $('<div>');
                        main_container.attr('data-toggle', 'tooltip');
                        main_container.attr('data-placement', 'bottom');
                        main_container.attr('title', val.short_description);
                        main_container.attr('role', 'tooltip');
                        main_container.addClass('col-12 col-sm-6 col-lg-4');

                        let product_wrapper = $('<div>');
                        product_wrapper.addClass('single-product-wrapper');
                        product_wrapper.appendTo(main_container);

                        let product_img = $('<div>');
                        product_img.addClass('product-img');
                        product_img.appendTo(product_wrapper);

                        let main_img = $('<img>');
                        main_img.addClass('book-image');
                        main_img.attr('alt', 'Product Image');

                        let hover_img = $('<img>');
                        hover_img.addClass('hover-img book-image');
                        hover_img.attr('alt', 'Product Image');

                        if (val.photos.length > 0) {
                            if (val.photos.length > 1) {
                                main_img.attr('src', `/uploads/${val.photos[0].name}`);
                                hover_img.attr('src', `/uploads/${val.photos[1].name}`);
                            } else {
                                main_img.attr('src', `/uploads/${val.photos[0].name}`);
                                hover_img.attr('src', `/uploads/${val.photos[0].name}`);
                            }
                        } else {
                            main_img.attr('src', '/uploads/default_image.png');
                            hover_img.attr('src', '/uploads/default_image.png');
                        }

                        main_img.appendTo(product_img);
                        hover_img.appendTo(product_img);

                        let description_container = $('<div>');
                        description_container.addClass('product-description');
                        description_container.appendTo(product_wrapper);

                        let author_container = $('<span>');
                        let authors = [];
                        $.each(val.authors, (a_idx, a_val) => {
                            authors.push(a_val.full_name);
                        });

                        author_container.text(authors.join());
                        author_container.appendTo(description_container);

                        let details_link = $('<a>');
                        details_link.attr('href', `/book/details/${val.id}`);
                        details_link.appendTo(description_container);

                        let name_header = $('<h6>');
                        name_header.text(val.name);
                        name_header.appendTo(details_link);

                        let price_container = $('<p>');
                        price_container.addClass('product-price');
                        price_container.text(`$${val.price}`);
                        price_container.appendTo(description_container);

                        main_container.appendTo($('#books-container'));
                    });
                }
            }
        });
    }

    if ($('#book-details-container').length > 0) {
        let id = $('#book-details-container').data('id');

        $.ajax({
            type: 'GET',
            url: `/book/load_full_book/${id}`,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {

                if (data) {
                    let authors = [];
                    $.each(data.authors, (a_idx, a_val) => {
                        authors.push(a_val.full_name);
                    });

                    $('#authors').text(authors.join());
                    $('#book_name').text(data.name);
                    $('#book_price').text(`$${data.price}`);
                    $('#book_desc').text(data.description);
                    $('#year_publ').text(data.year_of_publishing);
                    $('#pages').text(data.pages);
                    $('#isbn').text(data.isbn);
                    $('#publisher').text(data.publisher);
                    $('#category').text(data.category);
                }
            },
            error: function () {
                window.location = '/';
            }
        });
    }

    // Index Action End

    // Account Action Start

    $('#signInForm').submit((e) => {

        let user = {
            username: $('#username').val(),
            password: $('#password').val()
        };
        let hasError = false;

        if (user.username == null ||
            user.username == undefined ||
            user.username == '') {
            $('#username').addClass('is-invalid');
            hasError = true;
        } else {
            $('#username').removeClass('is-invalid');
        }

        if (user.password == null ||
            user.password == undefined ||
            user.password == '') {
            $('#password').addClass('is-invalid');
            hasError = true;
        } else {
            $('#password').removeClass('is-invalid');
        }

        if (hasError) {
            e.preventDefault();
            return;
        }
    });

    $('#signUpForm').submit((e) => {

        let user = {
            username: $('#username').val(),
            password: $('#password').val(),
            confirmpassword: $('#confirmpassword').val()
        };
        let hasError = false;

        if (user.username == null ||
            user.username == undefined ||
            user.username == '') {
            $('#username').addClass('is-invalid');
            hasError = true;
        } else {
            $('#username').removeClass('is-invalid');
        }

        if (user.password == null ||
            user.password == undefined ||
            user.password == '' ||
            user.password.length < 6) {
            $('#password').addClass('is-invalid');
            hasError = true;
        } else {
            $('#password').removeClass('is-invalid');
        }

        if (user.password != user.confirmpassword) {
            $('#confirmpassword').addClass('is-invalid');
            hasError = true;
        } else {
            $('#confirmpassword').removeClass('is-invalid');
        }

        if (hasError) {
            e.preventDefault();
            return;
        }
    });

    $('#searchForm').submit((e) => {
        e.preventDefault();

        let searchValue = $('#headerSearch').val();

        if (searchValue && searchValue.trim()) {
            console.log(window.location.href + `?search=${searchValue}`);
            window.location.href = window.location.origin + `/?search=${searchValue}`;
        }
    });

    // Account Action End
});