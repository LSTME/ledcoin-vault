$().ready(() => {
  $('[data-confirm]').click(e => confirm($(e.target).data('confirm')));

  $('[data-ledcode]').each((i, e) => {
    const target = $(e);
    const code = target.data('ledcode');
    const data = code.match(/\w\w/g).map(m => parseInt(m, 16));
    const box = target.find('figure');
    const blinker = new Ledcode(box[0]);

    target.find('[data-ledcode-play]').click((_) => {
      blinker.transmit(data);
    });
  });
});

