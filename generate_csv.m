close all;

img = imread("twitter.png") / 255;
gray = rgb2gray(img);
img = imbinarize(gray);

N = 2000;
out_index = ones(N * 2, 1);
points = zeros(N, 2);

while sum(out_index) > 0
    points = points + reshape([(1 + (rand(N, 1)) .* (width(img) - 1)); (1 + (rand(N, 1)) .* (height(img) - 1))] .* out_index, N, 2);
    index = floor(points(:, 2)) + floor(points(:, 1) - 1) * height(img);
    out_index = img(index);
    out_index = repmat(out_index, 2, 1);
    points = reshape(points(:) .* ~out_index, N, 2);
end

figure;
imshow(img);
hold on;
plot(points(:, 1), points(:, 2), '.');

points = [(points(:,1) - width(img) / 2) / (width(img) / 2) (points(:,2) - height(img) / 2) / (height(img) / 2)];
points = [points randn(N, 1) / 3];

writematrix(points, "twitter.csv");