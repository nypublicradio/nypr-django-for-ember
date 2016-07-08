import moveOver from "./move-over";
import { animate, stop} from "liquid-fire";

export default function initialTransition(opts={}) {
  let background = window.$(".discover-fadeable-background");

  if (!this.oldElement) {
    // initial render. A little hacky, because we set that background
    // image to 0 opacity in the dom and have to modify it now. That's
    background.css('opacity', 1);
    this.newElement.show();

    return animate(this.newElement, {opacity: 1, duration: 0});
  }

  else if (this.oldElement.find('.discover-welcome-screen').length > 0) {
    stop(this.oldElement);
    return animate(background, {opacity: 0, duration: 0.5}, opts).then(() => {
      return moveOver.call(this, 'x', -1).then(() => {
        window.$('.liquid-child').css('transform', 'initial');
      });
    });
  }
  else {
    background.css('opacity', 0);
    return moveOver.call(this, 'x', 1).then(() => {
      return animate(background, {opacity: 1, duration: 0.5}, opts).then(() => {
        window.$('.liquid-child').css('transform', 'initial');
      });
    });

  }


}