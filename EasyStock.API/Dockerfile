# 1) Build
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copie csproj et restore
COPY EasyStock.API/*.csproj ./
RUN dotnet restore EasyStock.API.csproj

# Copie tout et build
COPY EasyStock.API/. ./
WORKDIR /src
RUN dotnet publish -c Release -o /app/publish

# 2) Runtime
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Variables d'environnement (à ajuster si besoin)
ENV ASPNETCORE_URLS=http://+:5200
ENV ConnectionStrings__Default="Server=mysql;Database=easystock;User=root;Password=example;"

EXPOSE 5200
ENTRYPOINT ["dotnet", "EasyStock.API.dll"]