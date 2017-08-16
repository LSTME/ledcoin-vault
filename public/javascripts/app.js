$().ready(() => {
  $('[data-confirm]').click(e => confirm($(e.target).data('confirm')));
});

