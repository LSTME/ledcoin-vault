$().ready(() => {
  $('[data-confirm]').click(e => confirm($(e.target).data('confirm')));

  $('[data-ledcode]').each((i, e) => {
    const target = $(e);
    const data = target.data('ledcode');
    const box = target.find('figure');
    const blinker = new Ledcode(box[0]);

    target.find('[data-ledcode-play]').click((_) => {
      blinker.transmit(data);
    });
  });

  $('table.is-clickable tr').click((e) => {
    if (e.target.href) return true;

    const href = $(e.target).parent('[data-href]').data('href');
    if (href) {
      window.location.href = href;
    }
    return false;
  });
});

